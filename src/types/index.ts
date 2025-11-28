/**
 * Application type definitions
 * Using readonly for immutability optimization
 */

export interface AppConfig {
  readonly name: string;
  readonly desc: string;
  readonly icon: string;
}

export interface App extends AppConfig {
  readonly id: number;
  readonly url: string;
}

export type AppList = readonly App[];
