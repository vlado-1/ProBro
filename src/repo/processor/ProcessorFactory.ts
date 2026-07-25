import { IProcessor } from './IProcessor';
import { MockProcessor } from './mock/MockProcessor';

export class ProcessorFactory {
    public static getProcessorInstance(): IProcessor {
        return MockProcessor.getInstance();
    }
}
