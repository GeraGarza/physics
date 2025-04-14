#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Timeout settings (in seconds)
TIMEOUT=300  # 5 minutes

# Function to run a command with timeout
run_with_timeout() {
    local cmd="$1"
    local timeout="$2"
    timeout "$timeout" bash -c "$cmd"
    local status=$?
    if [ $status -eq 124 ]; then
        echo -e "${RED}Command timed out after $timeout seconds${NC}"
        return 1
    fi
    return $status
}

# Define exclude paths
EXCLUDE_PATHS="-not -path '*/node_modules/*' -not -path '*/dist/*' -not -path '*/coverage/*' -not -path '*/\.*'"
INCLUDE_TS_FILES="-name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx'"

# Function to find TypeScript and JavaScript files
find_ts_js_files() {
    eval "find . -type f \( ${INCLUDE_TS_FILES} \) ${EXCLUDE_PATHS}"
}

# Function to find only TypeScript files
find_ts_files() {
    eval "find . -type f \( -name '*.ts' -o -name '*.tsx' \) ${EXCLUDE_PATHS}"
}

# Function to find only JavaScript files
find_js_files() {
    eval "find . -type f \( -name '*.js' -o -name '*.jsx' \) ${EXCLUDE_PATHS}"
}

# Function to extract component names from a file
extract_component_names() {
    local file="$1"
    # Match both function components and class components
    grep -E "export (const|function|class) [A-Z][A-Za-z0-9]*|export default (function|class) [A-Z][A-Za-z0-9]*" "$file" | \
    sed -E 's/export (const|function|class) ([A-Z][A-Za-z0-9]*).*/\2/;s/export default (function|class) ([A-Z][A-Za-z0-9]*).*/\2/'
}

# Function to calculate file similarity (simple line-based diff)
calculate_similarity() {
    local file1="$1"
    local file2="$2"
    local total_lines=$(wc -l < "$file1")
    local matching_lines=$(comm -12 <(sort "$file1") <(sort "$file2") | wc -l)
    echo "scale=2; $matching_lines * 100 / $total_lines" | bc
}

# Function to analyze file types
analyze_file_types() {
    echo -e "\n${GREEN}File Type Analysis${NC}"
    echo "TypeScript files: $(find_ts_files | wc -l | tr -d ' ')"
    echo "JavaScript files: $(find_js_files | wc -l | tr -d ' ')"
    echo "TSX files: $(find . -type f -name "*.tsx" ${EXCLUDE_PATHS} | wc -l | tr -d ' ')"
    echo "JSX files: $(find . -type f -name "*.jsx" ${EXCLUDE_PATHS} | wc -l | tr -d ' ')"
}

# Function to analyze TypeScript specific features
analyze_typescript_features() {
    echo -e "\n${GREEN}TypeScript Feature Analysis${NC}"
    echo "Files using interfaces: $(find_ts_files -exec grep -l "interface " {} \; | wc -l | tr -d ' ')"
    echo "Files using types: $(find_ts_files -exec grep -l "type " {} \; | wc -l | tr -d ' ')"
    echo "Files using enums: $(find_ts_files -exec grep -l "enum " {} \; | wc -l | tr -d ' ')"
    echo "Files using generics: $(find_ts_files -exec grep -l "<[A-Za-z0-9_]*>" {} \; | wc -l | tr -d ' ')"
}

# Function to analyze JavaScript specific features
analyze_javascript_features() {
    echo -e "\n${GREEN}JavaScript Feature Analysis${NC}"
    echo "Files using ES6 classes: $(find_js_files -exec grep -l "class " {} \; | wc -l | tr -d ' ')"
    echo "Files using arrow functions: $(find_js_files -exec grep -l "=>" {} \; | wc -l | tr -d ' ')"
    echo "Files using async/await: $(find_js_files -exec grep -l "async\|await" {} \; | wc -l | tr -d ' ')"
    echo "Files using template literals: $(find_js_files -exec grep -l "\`" {} \; | wc -l | tr -d ' ')"
}

echo "=== Codebase Analysis Report ==="

# Add new analysis sections before the existing ones
analyze_file_types
analyze_typescript_features
analyze_javascript_features

# 1. Project Structure
echo -e "\n${GREEN}1. Project Structure${NC}"
echo "Main directories and file counts:"
run_with_timeout "find . -maxdepth 1 -type d -not -path '*/\.*' -not -name 'node_modules' -not -name 'dist' -not -name 'coverage' -not -name '.' | while read dir; do
    count=$(find "$dir" -type f ${EXCLUDE_PATHS} | wc -l | tr -d ' ')
    printf "%-40s %s files\n" "$dir" "$count"
done" $TIMEOUT

# 2. Large Files Analysis
echo -e "\n${GREEN}2. Large Files Analysis${NC}"
echo "Files over 300 lines (potential candidates for refactoring):"
find_ts_files | while read file; do
    lines=$(wc -l < "$file")
    if [ "$lines" -gt 300 ]; then
        printf "%-60s %8d lines\n" "$file" "$lines"
    fi
done

# 3. Type Safety Analysis
echo -e "\n${GREEN}3. Type Safety Analysis${NC}"
echo "Files using 'any' type:"
find_ts_files -exec grep -l "any" {} \; | wc -l | tr -d ' '
echo "Files using non-null assertions (!):"
find_ts_files -exec grep -l "!" {} \; | wc -l | tr -d ' '
echo "Files with type assertions (as):"
find_ts_files -exec grep -l "as " {} \; | wc -l | tr -d ' '

# 4. React Component Analysis
echo -e "\n${GREEN}4. React Component Analysis${NC}"
echo "Components by directory:"
find . -type f -name "*.tsx" ${EXCLUDE_PATHS} | sed 's/\/[^/]*$//' | sort | uniq -c | sort -nr

echo -e "\nClass Components (legacy):"
find_ts_files -exec grep -l "class.*extends.*Component" {} \;

echo -e "\nComponents using legacy context API:"
find_ts_files -exec grep -l "static contextType\|React.createContext(" {} \;

# 5. Performance Analysis
echo -e "\n${GREEN}5. Performance Analysis${NC}"
echo "Components without memoization:"
find . -type f -name "*.tsx" ${EXCLUDE_PATHS} -exec grep -L "React.memo\|memo" {} \;

echo -e "\nInline style usage (potential performance issue):"
find_ts_files -exec grep -l "style=" {} \; | wc -l | tr -d ' '

echo -e "\nUseEffect with empty dependency array (potential memory leak):"
find_ts_files -exec grep -l "useEffect.*(\s*(),\s*\[\s*\])" {} \; | wc -l | tr -d ' '

# 6. Test Coverage Analysis
echo -e "\n${GREEN}6. Test Coverage Analysis${NC}"
echo "Files missing tests:"
find_ts_files -not -name "*.test.ts" -not -name "*.test.tsx" -exec sh -c '
    file="$1"
    test_file="${file%.ts}*.test.ts"
    test_file_tsx="${file%.tsx}*.test.tsx"
    if ! find . -path "*$test_file" -o -path "*$test_file_tsx" | grep -q .; then
        echo "$file"
    fi
' sh {} \;

echo -e "\nTest files using legacy test patterns:"
find . -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) ${EXCLUDE_PATHS} -exec grep -l "enzyme\|shallow\|mount" {} \;

# 7. Import/Export Analysis
echo -e "\n${GREEN}7. Import/Export Analysis${NC}"
echo "Relative path imports (../*):       $(find_ts_files -exec grep -l "from '\.\." {} \; | wc -l | tr -d ' ')"

echo -e "\nCommonJS imports/exports:"
find_ts_files -exec grep -l "require(\|module.exports" {} \;

echo -e "\nDefault exports (prefer named exports):       $(find_ts_files -exec grep -l "export default" {} \; | wc -l | tr -d ' ')"

# 8. Electron Architecture Analysis
echo -e "\n${GREEN}8. Electron Architecture Analysis${NC}"
echo "IPC usage count:"
find_ts_files -exec grep -l "ipcMain\|ipcRenderer" {} \; | wc -l | tr -d ' '

echo -e "\nDirect electron imports in renderer (potential security issue):"
find ./src -type f ${EXCLUDE_PATHS} -exec grep -l "require('electron')\|from 'electron'" {} \;

# 9. Development Artifacts
echo -e "\n${GREEN}9. Development Artifacts${NC}"
echo "Console statements:"
echo "  console.log:       $(find_ts_files -exec grep -l "console.log" {} \; | wc -l | tr -d ' ')"
echo "  console.debug:     $(find_ts_files -exec grep -l "console.debug" {} \; | wc -l | tr -d ' ')"
echo "  console.error:     $(find_ts_files -exec grep -l "console.error" {} \; | wc -l | tr -d ' ')"

echo -e "\nDebugger statements:"
find_ts_files -exec grep -l "debugger;" {} \;

# 10. Technical Debt Indicators
echo -e "\n${GREEN}10. Technical Debt Indicators${NC}"
echo "TODO/FIXME comments:"
find_ts_files -exec grep -l "TODO\|FIXME" {} \;

echo -e "\nDeprecated React imports:"
find_ts_files -exec grep -l "React.createClass\|componentWillMount\|componentWillReceiveProps" {} \;

# 11. Legacy Code Analysis
echo -e "\n${GREEN}11. Legacy Code Analysis${NC}"
echo "Potentially unused files:"
find_ts_files -exec sh -c '
    file="$1"
    filename=$(basename "$file")
    if ! find . -type f ${EXCLUDE_PATHS} -not -path "$file" -exec grep -l "$filename" {} \; | grep -q .; then
        echo "$file"
    fi
' sh {} \;

echo -e "\nDeprecated Code Patterns:"
echo "Legacy React patterns:"
echo "  Class components:       $(find_ts_files -exec grep -l "class.*extends.*Component" {} \; | wc -l | tr -d ' ')"
echo "  Legacy lifecycle methods:       $(find_ts_files -exec grep -l "componentWillMount\|componentWillReceiveProps" {} \; | wc -l | tr -d ' ')"
echo "  Legacy context API:       $(find_ts_files -exec grep -l "static contextType\|React.createContext(" {} \; | wc -l | tr -d ' ')"

echo -e "\nLegacy JavaScript patterns:"
echo "  var declarations:       $(find_ts_files -exec grep -l "\bvar\b" {} \; | wc -l | tr -d ' ')"
echo "  Function declarations in blocks:       $(find_ts_files -exec grep -l "function.*{.*function" {} \; | wc -l | tr -d ' ')"

echo -e "\nOrphaned Test Files:"
find . -type f \( -name "*.test.ts" -o -name "*.test.tsx" \) ${EXCLUDE_PATHS} -exec sh -c '
    test_file="$1"
    base_name=$(basename "$test_file" .test.ts)
    base_name=${base_name%.test.tsx}
    if ! find . -type f \( -name "${base_name}.ts" -o -name "${base_name}.tsx" \) -not -name "*.test.*" ${EXCLUDE_PATHS} | grep -q .; then
        echo "$test_file"
    fi
' sh {} \;

echo -e "\n${YELLOW}Large Type Definition Files (>100 lines):${NC}"
find . -type f -name "*.d.ts" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/coverage/*" \
    -not -path "*/build/*" \
    -not -path "*/out/*" \
    -not -path "*/.next/*" \
    -not -path "*/.cache/*" \
    -not -path "*/.yarn/*" \
    -exec sh -c '
    file="$1"
    lines=$(wc -l < "$file")
    if [ "$lines" -gt 100 ]; then
        printf "%-60s %8d lines\n" "$file" "$lines"
    fi
' sh {} \;

# 12. Component Analysis
echo -e "\n${BLUE}12. Component Analysis${NC}"

# Create a temporary directory for component analysis
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Find all components and their locations
echo -e "\n${GREEN}Component Inventory:${NC}"
declare -A component_locations
declare -A component_files

echo "Scanning for components..."
while IFS= read -r file; do
    echo -n "."
    while IFS= read -r component; do
        if [ -n "$component" ]; then
            component_locations["$component"]+="$file "
            component_files["$file"]+="$component "
        fi
    done < <(extract_component_names "$file")
done < <(find_ts_files)
echo -e "\nDone scanning components."

# Find potentially duplicate components
echo -e "\n${YELLOW}Potentially Duplicate Components:${NC}"
for component in "${!component_locations[@]}"; do
    locations=(${component_locations[$component]})
    if [ ${#locations[@]} -gt 1 ]; then
        echo -e "\nComponent '$component' found in multiple files:"
        for location in "${locations[@]}"; do
            echo "  - $location"
        done
    fi
done

# Find similar components using content comparison
echo -e "\n${YELLOW}Similar Components (by content):${NC}"
echo "Comparing components (this may take a while)..."
while IFS= read -r file1; do
    echo -n "."
    while IFS= read -r file2; do
        if [ "$file1" != "$file2" ]; then
            similarity=$(calculate_similarity "$file1" "$file2")
            if [ $(echo "$similarity > 80" | bc) -eq 1 ]; then
                echo -e "\nHigh similarity ($similarity%) between:"
                echo "  - $file1"
                echo "  - $file2"
            fi
        fi
    done < <(find_ts_files)
done < <(find_ts_files)
echo -e "\nDone comparing components."

# Find potentially unused components
echo -e "\n${RED}Potentially Unused Components:${NC}"
echo "Checking for unused components..."
for component in "${!component_locations[@]}"; do
    echo -n "."
    # Skip if component is used in other files
    if ! find_ts_files -exec grep -l "import.*$component\|<$component" {} \; | grep -q .; then
        echo -e "\nComponent '$component' defined in:"
        for location in ${component_locations[$component]}; do
            echo "  - $location"
        done
        echo "  No imports or usages found"
    fi
done
echo -e "\nDone checking for unused components."

echo -e "\n${GREEN}Analysis complete!${NC}" 