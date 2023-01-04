import { Provider, Injectable } from '@opensumi/di';
import { BrowserModule } from '@opensumi/ide-core-browser';
import { ToolbarThemeContribution } from './toolbar-theme.contribution';
import { TopTabContribution } from './top-tab.contribution';

@Injectable()
export class TopTabModule extends BrowserModule {
  providers: Provider[] = [
    ToolbarThemeContribution,
    TopTabContribution,
  ];
}
