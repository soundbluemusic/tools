/**
 * Application type definitions
 * Using readonly for immutability optimization
 */

export interface App {
  readonly id: number;
  readonly name: string;
  readonly desc: string;
  readonly icon: string;
  readonly url: string;
}

export type AppList = readonly App[];
