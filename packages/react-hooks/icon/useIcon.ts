import useService from "@micro-frame/plugin-react/useService";
import { SVGService } from "@xxxs-shop/services-svg/types";

const useIcon = (name: string) => useService<SVGService>('svg').getIconSrc(name);

export default useIcon;
