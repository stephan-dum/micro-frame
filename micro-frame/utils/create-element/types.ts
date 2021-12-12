import { IRenderContext } from "@micro-frame/core/types";

export interface TemplateProps {
  [key: string]: unknown;
  root?: string;
}

export type TemplateTagName = string;
export interface TemplateNodeObject {
  tagName: TemplateTagName;
  props?: TemplateProps;
  children?: TemplateNode[];
}

export type TemplateNode = TemplateNodeObject | string;

export type TemplateNodeFactory = (context: IRenderContext) => TemplateNode;
export type TemplateDescriptor = TemplateNodeFactory | TemplateNode;
