# Fix Metro build error by removing unused broken dependency


## Problem
The `react-native-worklets` package is listed in the project's dependencies but is not used anywhere in the app. It is incompatible with the current setup and prevents all other packages (including Expo itself) from installing correctly — causing Metro to fail with "Script not found: expo".

## Fix
- [x] Remove `react-native-worklets` from the dependency list in `package.json`
- [x] This allows all remaining packages to install cleanly, restoring the `expo` binary and letting Metro start normally
- [x] No app functionality is affected since this package was never actually used
