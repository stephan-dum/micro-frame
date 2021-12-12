import useService from "@micro-frame/plugin-react/useService";
import { ConfigService } from "@xxxs-shop/services-config/types";

const useConfig = () => useService<ConfigService>('config');

export default useConfig;
