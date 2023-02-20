import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() => openUrl('https://rivervalley.org/all-small-groups/')}
          icon="groups"
          label="Groups"
        />
        <ActionBarItem
          onPress={() => openUrl('https://rock.rivervalley.org/myaccount')}
          icon="user"
          label="My Account"
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
