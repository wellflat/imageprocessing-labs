/**
 * Shared types across multiple machine learning components.
 */
export type Feature = { index: number, value: number }[];
export type DataSet = { label: number, x: Feature }[];