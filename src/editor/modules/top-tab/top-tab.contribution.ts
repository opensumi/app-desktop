import { Domain, SlotRendererContribution, SlotRendererRegistry } from '@opensumi/ide-core-browser';
import { ComponentContribution, ComponentRegistry } from '@opensumi/ide-core-browser/lib/layout';

import { LeftTabRenderer, RightTabRenderer, CenterTabRenderer } from './renderer';
import { TopTab } from './top-tab';

@Domain(ComponentContribution, SlotRendererContribution)
export class TopTabContribution implements ComponentContribution, SlotRendererContribution {

  registerComponent(registry: ComponentRegistry): void {
    registry.register('@opensumi/ide-top-tab', {
      id: 'top-tab',
      component: TopTab,
    }, {
      size: 56,
    });
  }

  registerRenderer(registry: SlotRendererRegistry) {
    registry.registerSlotRenderer('left', LeftTabRenderer as any);
    registry.registerSlotRenderer('center', CenterTabRenderer as any);
    registry.registerSlotRenderer('right', RightTabRenderer as any);
  }
}
