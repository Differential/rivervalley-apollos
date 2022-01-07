import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() => openUrl('https://www.rivervalley.org/smallgroups/')}
          icon="groups"
          label="Groups"
        />
        <ActionBarItem
          onPress={() =>
            openUrl('https://www.rivervalley.org/next-steps/serve/')
          }
          icon="like"
          label="Serve"
        />
        <ActionBarItem
          onPress={() =>
            openUrl('http://www.rivervalley.org/give', {
              externalBrowser: true,
            })
          }
          icon="bank"
          label="Give"
        />
      </ActionBar>
    )}
  </RockAuthedWebBrowser>
);

export default Toolbar;
