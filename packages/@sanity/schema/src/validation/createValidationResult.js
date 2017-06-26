// @flow
import type {ValidationResult} from '../flowtypes'

// Temporary solution to ensure we have a central registry over used helpIds
const KNOWN_HELP_IDS = [
  'schema-invalid-name',
  'schema-type-duplicate-name',
  'schema-type-missing-type',
  'schema-type-invalid-or-missing-attr-name',
  'schema-type-invalid-or-missing-attr-type',
  'schema-subtype-inheritance',
  'schema-object-type-missing-required-props',
  'schema-member-type-cannot-be-named',
  'schema-object-type-fields-must-be-array',
  'schema-object-type-fields-not-unique',
  'schema-type-invalid-or-missing-attr-title',
  'schema-array-type-of-must-be-array',
  'schema-array-type-of-must-have-unique-types',
  'schema-reference-type-to-must-be-array',
  'schema-reference-type-to-must-have-unique-types',
]

function createValidationResult(severity: string, message: string, helpId: ?string,
                                path: ?string[]): ValidationResult {

  if (helpId && !KNOWN_HELP_IDS.includes(helpId)) {
    throw new Error(`Used the unknown helpId "${helpId}", please add it to the array in createValidationResult.js`)
  }
  return {
    severity,
    message,
    helpId,
    path
  }
}

export const error = (message: string, helpId: ?string, path: ?string[]) =>
  createValidationResult('error', message, helpId, path)

export const warning = (message: string, helpId: ?string, path: ?string[]) =>
  createValidationResult('warning', message, helpId, path)

export const info = (message: string, helpId: ?string, path: ?string[]) =>
  createValidationResult('info', message, helpId, path)
