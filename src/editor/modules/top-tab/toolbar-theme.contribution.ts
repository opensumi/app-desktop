import { Autowired } from '@opensumi/di';
import { ClientAppContribution } from '@opensumi/ide-core-browser/lib/common';
import { Domain } from '@opensumi/ide-core-common';
import { ExtColorContribution, IThemeService } from '@opensumi/ide-theme/lib/common';

@Domain(ClientAppContribution)
export class ToolbarThemeContribution implements ClientAppContribution {
  @Autowired(IThemeService)
  private readonly themeService: IThemeService;

  initialize() {
    this.themeService.onThemeChange(async (currentTheme) => {
      const menubarBg = currentTheme.getColor('kt.menubar.background');
      if (!menubarBg) {
        return;
      }

      // 定义顶部按钮 Token 样式
      const customColors: ExtColorContribution[] = [
        {
          id: 'kt.toolbarButton.selectionForeground',
          description: 'Active toolbar button foreground.',
          defaults: {
            dark: '#FFFFFFFF',
            light: '#FF5000FF',
            highContrast: '#FFFFFFFF',
          },
        },
        {
          id: 'kt.toolbarButton.selectionBackground',
          description: 'Active toolbar button background.',
          defaults: {
            dark: menubarBg.darken(0.19).toString(),
            light: menubarBg.darken(0.03).toString(),
            highContrast: '#FFFFFFFF',
          },
        },
        {
          id: 'kt.toolbarButton.foreground',
          description: 'Default toolbar button foreground.',
          defaults: {
            dark: '#909399FF',
            light: '#787A80FF',
            highContrast: '#909399FF',
          },
        },
        {
          id: 'kt.toolbarButton.background',
          description: 'Default toolbar button background.',
          defaults: {
            dark: menubarBg.darken(-0.27).toString(),
            light: menubarBg.darken(-0.02).toString(),
            highContrast: '#333B4EFF',
          },
        },
      ];

      const themeType = await this.themeType(currentTheme.themeData.base);
      let cssVariables = ':root{';
      for (const color of customColors) {
        const hexRule = `--${color.id.replace(/\./g, '-')}: ${color.defaults[themeType]};\n`;
        cssVariables += hexRule;
      }
      const styleNode = document.getElementById('custom-theme-style');
      if (styleNode) {
        styleNode.innerHTML = `${cssVariables}}`;
      } else {
        const styleNode = document.createElement('style');
        styleNode.id = 'custom-theme-style';
        styleNode.innerHTML = `${cssVariables}}`;
        document.getElementsByTagName('head')[0].appendChild(styleNode);
      }
    });
  }

  async themeType(themeBase: string) {
    if (themeBase === 'vs-dark') {
      return 'dark';
    } if (themeBase === 'vs') {
      return 'light';
    } if (themeBase === 'hc-black') {
      return 'highContrast';
    }
    throw new Error('Wrong theme base name');

  }
}
