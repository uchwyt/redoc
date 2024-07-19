// import original module declarations
import 'styled-components';
import { ColorSetting, FontSettings, HTTPResponseColos, Servers } from '../theme';


// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    spacing: {
      unit: number;
      sectionHorizontal: number;
      sectionVertical: number;
    };
    breakpoints: {
      small: string;
      medium: string;
      large: string;
    };
    colors: {
      tonalOffset: number;
      primary: ColorSetting;
      success: ColorSetting;
      warning: ColorSetting;
      error: ColorSetting;
      gray: {
        50: string;
        100: string;
      };
      border: {
        light: string;
        dark: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
      responses: {
        success: HTTPResponseColos;
        error: HTTPResponseColos;
        redirect: HTTPResponseColos;
        info: HTTPResponseColos;
      };
      http: {
        get: string;
        post: string;
        put: string;
        options: string;
        patch: string;
        delete: string;
        basic: string;
        link: string;
        head: string;
      };
    };
    schema: {
      linesColor: string;
      defaultDetailsWidth: string;
      typeNameColor: string;
      typeTitleColor: string;
      requireLabelColor: string;
      labelsTextSize: string;
      nestingSpacing: string;
      nestedBackground: string;
      arrow: {
        size: string;
        color: string;
      };
    };
    typography: {
      fontSize: string;
      lineHeight: string;
      fontWeightLight: string;
      fontWeightRegular: string;
      fontWeightBold: string;
      fontFamily: string;

      smoothing: string;
      optimizeSpeed: boolean;

      code: FontSettings & {
        backgroundColor: string;
        wrap: boolean;
      };
      headings: {
        fontFamily: string;
        fontWeight: string;
        lineHeight: string;
      };

      links: {
        color: string;
        visited: string;
        hover: string;
        textDecoration: string;
        hoverTextDecoration: string;
      };
    };
    sidebar: {
      width: string;
      backgroundColor: string;
      textColor: string;
      activeTextColor: string;
      groupItems: {
        activeBackgroundColor: string;
        activeTextColor: string;
        textTransform: string;
      };
      level1Items: {
        activeBackgroundColor: string;
        activeTextColor: string;
        textTransform: string;
      };
      arrow: {
        size: string;
        color: string;
      };
    };
    logo: {
      maxHeight: string;
      maxWidth: string;
      gutter: string;
    };
    rightPanel: {
      backgroundColor: string;
      textColor: string;
      width: string;
      servers: Servers;
    };
    codeBlock: {
      backgroundColor: string;
    };
    fab: {
      backgroundColor: string;
      color: string;
    };

    extensionsHook?: (name: string, props: any) => string;
  }
}
