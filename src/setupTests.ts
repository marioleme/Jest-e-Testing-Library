import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';

global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;