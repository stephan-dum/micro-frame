import useService from "@micro-frame/plugin-react/useService";
import { LoggerService } from "@xxxs-shop/services-logger/types";

const useLogger = () => useService<LoggerService>('logger');

export default useLogger;
