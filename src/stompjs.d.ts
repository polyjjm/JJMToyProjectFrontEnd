import { StompConfig } from '@stomp/stompjs';

declare module '@stomp/stompjs' {
  interface StompConfig {
    onError?: (error: any) => void;
  }
}