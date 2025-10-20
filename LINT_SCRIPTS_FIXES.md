# Lint Scripts Fixes for CI/CD Pipeline

## 🎯 **Issue Identified**

### **Problem**

The CI/CD pipeline was failing because multiple packages were missing `lint` scripts:

- `packages/common` - Missing lint script
- `packages/contracts` - Missing lint script
- `packages/database` - Missing lint script
- `packages/ui` - Had lint script but wrong import path

### **Error Message**

```
Missing script: "lint"
```

---

## 🔧 **Solution Applied**

### **1. Added Lint Scripts to All Packages**

#### **packages/common/package.json**

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "lint": "eslint \"src/**/*.ts\" --fix"
  }
}
```

#### **packages/contracts/package.json**

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "lint": "eslint \"src/**/*.ts\" --fix"
  }
}
```

#### **packages/database/package.json**

```json
{
  "scripts": {
    // ... existing scripts ...
    "lint": "eslint \"src/**/*.ts\" --fix"
  }
}
```

### **2. Added ESLint Configuration Files**

#### **Created eslint.config.mjs for all packages:**

- `packages/common/eslint.config.mjs`
- `packages/contracts/eslint.config.mjs`
- `packages/database/eslint.config.mjs`

#### **Configuration Template:**

```javascript
import { config } from "@payrollx/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config;
```

### **3. Fixed Import Paths**

#### **packages/ui/eslint.config.mjs**

- ❌ **Before**: `import { config } from "@repo/eslint-config/react-internal";`
- ✅ **After**: `import { config } from "@payrollx/eslint-config/react-internal";`

### **4. Fixed TypeScript Interface Warning**

#### **packages/ui/src/input.tsx**

- ❌ **Before**: Empty interface causing ESLint warning

```typescript
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
```

- ✅ **After**: Type alias (more appropriate for this case)

```typescript
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
```

---

## 📊 **Files Modified**

### **Package.json Updates**

1. `packages/common/package.json` - Added lint script
2. `packages/contracts/package.json` - Added lint script
3. `packages/database/package.json` - Added lint script

### **ESLint Configuration Files**

1. `packages/common/eslint.config.mjs` - Created
2. `packages/contracts/eslint.config.mjs` - Created
3. `packages/database/eslint.config.mjs` - Created
4. `packages/ui/eslint.config.mjs` - Fixed import path

### **Source Code Fixes**

1. `packages/ui/src/input.tsx` - Fixed TypeScript interface warning

---

## 🚀 **Testing Results**

### **Package Lint Tests**

```bash
# Test each package individually
npm run lint --workspace=packages/common    # ✅ Works (with warnings)
npm run lint --workspace=packages/contracts # ✅ Works
npm run lint --workspace=packages/database  # ✅ Works
npm run lint --workspace=packages/ui        # ⚠️ Works (with warnings)
```

### **CI/CD Compatibility**

- ✅ **All packages now have lint scripts**
- ✅ **ESLint configurations are properly set up**
- ✅ **Import paths are correct**
- ⚠️ **Some packages have warnings (but scripts exist)**

---

## ⚠️ **Remaining Warnings**

### **packages/common**

- Environment variable warnings (turbo/no-undeclared-env-vars)
- TypeScript `any` type warnings
- Unused variable warnings

### **packages/ui**

- React prop-types validation warnings (not needed for TypeScript)

### **Impact on CI/CD**

- The CI pipeline will now find the lint scripts
- Warnings may still cause failures if CI uses `--max-warnings 0`
- Consider adjusting CI pipeline to handle warnings appropriately

---

## 🎯 **Next Steps**

### **For CI/CD Pipeline**

1. **Test the pipeline** - The missing script error should be resolved
2. **Handle warnings** - Either fix remaining warnings or adjust CI strictness
3. **Environment variables** - Add missing env vars to turbo.json if needed

### **For Development**

1. **Fix remaining warnings** - Address TypeScript and ESLint warnings
2. **Environment configuration** - Update turbo.json with required env vars
3. **Code quality** - Improve type safety and remove unused code

---

## 🎉 **Result**

### **Status: Lint Scripts Added Successfully**

- ✅ **All packages have lint scripts**
- ✅ **ESLint configurations are properly set up**
- ✅ **CI/CD pipeline will no longer fail on missing scripts**
- ⚠️ **Some warnings remain but can be addressed separately**

The CI/CD pipeline should now pass the "Lint packages" step without the "Missing script: lint" error! 🚀

---

_Generated on: 2025-10-20_
_Status: Lint Scripts Added - CI/CD Ready_
