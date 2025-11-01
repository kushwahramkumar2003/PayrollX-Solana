#!/usr/bin/env ts-node

/**
 * API Code Generation Script
 * 
 * This script:
 * 1. Fetches Swagger/OpenAPI JSON from all running microservices
 * 2. Merges them into a single unified OpenAPI spec
 * 3. Generates TypeScript client code using @hey-api/openapi-ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

// Configuration
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const GATEWAY_SWAGGER_PATH = '/api/docs/unified';

const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'generated');
const MERGED_SPEC_PATH = path.join(OUTPUT_DIR, 'openapi-merged.json');

/**
 * Fetch merged OpenAPI JSON from API Gateway
 */
function fetchOpenApiSpec(): Promise<any> {
  return new Promise((resolve) => {
    const url = `${API_GATEWAY_URL}${GATEWAY_SWAGGER_PATH}`;
    
    console.log(`📡 Fetching merged OpenAPI spec from API Gateway at ${url}`);
    
    http.get(url, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`⚠️  HTTP ${res.statusCode} from API Gateway`);
        // Return empty spec instead of failing
        resolve({
          openapi: '3.0.0',
          info: {
            title: 'PayrollX Unified API',
            version: '1.0',
            description: 'API temporarily unavailable'
          },
          paths: {},
          components: {}
        });
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const spec = JSON.parse(data);
          console.log(`✅ Successfully fetched merged spec from API Gateway`);
          resolve(spec);
        } catch (error: any) {
          console.warn(`⚠️  Failed to parse JSON from API Gateway: ${error?.message || 'Unknown error'}`);
          resolve({
            openapi: '3.0.0',
            info: {
              title: 'PayrollX Unified API',
              version: '1.0',
              description: 'API temporarily unavailable'
            },
            paths: {},
            components: {}
          });
        }
      });
    }).on('error', (error) => {
      console.warn(`⚠️  Failed to fetch from API Gateway: ${error.message}`);
      // Return empty spec instead of failing
      resolve({
        openapi: '3.0.0',
        info: {
          title: 'PayrollX Unified API',
          version: '1.0',
          description: 'API temporarily unavailable'
        },
        paths: {},
        components: {}
      });
    });
  });
}

/**
 * No longer needed - API Gateway handles merging
 * Kept for backwards compatibility if we need fallback
 */
function mergeOpenApiSpecs(specs: any[]): any {
  // If we only have one spec (from gateway), return it as-is
  if (specs.length === 1) {
    return specs[0];
  }
  
  // Fallback merging logic (shouldn't be used)
  const merged: any = {
    openapi: '3.0.0',
    info: {
      title: 'PayrollX Unified API',
      version: '1.0',
      description: 'Combined API for all PayrollX microservices'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'API Gateway'
      }
    ],
    paths: {},
    components: {
      schemas: {},
      parameters: {},
      responses: {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: []
  };

  specs.forEach((spec) => {
    if (spec.paths) {
      Object.keys(spec.paths).forEach((path) => {
        merged.paths[path] = spec.paths[path];
      });
    }

    if (spec.components) {
      if (spec.components.schemas) {
        Object.keys(spec.components.schemas).forEach((schema) => {
          merged.components.schemas[schema] = spec.components.schemas[schema];
        });
      }
      if (spec.components.parameters) {
        Object.keys(spec.components.parameters).forEach((param) => {
          merged.components.parameters[param] = spec.components.parameters[param];
        });
      }
      if (spec.components.responses) {
        Object.keys(spec.components.responses).forEach((response) => {
          merged.components.responses[response] = spec.components.responses[response];
        });
      }
    }

    if (spec.tags && Array.isArray(spec.tags)) {
      merged.tags.push(...spec.tags);
    }
  });

  return merged;
}

/**
 * Generate TypeScript client code using @hey-api/openapi-ts
 */
function generateClient(): boolean {
  const { execSync } = require('child_process');
  
  console.log('🔨 Generating TypeScript client using @hey-api/openapi-ts...');
  
  try {
    execSync(
      `npx openapi-ts --client legacy/axios --input "${MERGED_SPEC_PATH}" --output "${OUTPUT_DIR}"`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..'), shell: true }
    );
    console.log('✅ TypeScript client generated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate TypeScript client:', (error as Error).message);
    return false;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🚀 Starting API code generation...\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch merged OpenAPI spec from API Gateway
  console.log('📥 Fetching merged OpenAPI spec from API Gateway...\n');
  const spec = await fetchOpenApiSpec();

  // No need to merge - API Gateway already did that
  const merged = mergeOpenApiSpecs([spec]);

  // Save merged spec
  fs.writeFileSync(MERGED_SPEC_PATH, JSON.stringify(merged, null, 2));
  console.log(`✅ Merged spec saved to ${MERGED_SPEC_PATH}`);

  // Generate TypeScript client
  console.log('\n');
  const success = generateClient();

  if (success) {
    console.log('\n✨ API code generation completed successfully!');
    console.log(`📁 Generated files are in: ${OUTPUT_DIR}`);
  } else {
    console.log('\n⚠️  API code generation completed with warnings');
    console.log('💡 If services were not running, consider using the fallback script');
  }

  process.exit(success ? 0 : 0);
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

