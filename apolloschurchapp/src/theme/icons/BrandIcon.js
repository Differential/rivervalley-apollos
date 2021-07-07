import React from 'react';
import PropTypes from 'prop-types';
import Svg, { Path } from 'react-native-svg';

import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(({ size = 32, fill } = {}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3.75186 14.5425L7.22622 22.2418C7.32181 22.4537 7.53261 22.5898 7.76495 22.5898H10.645C10.9766 22.5898 11.1976 22.2474 11.061 21.9452L7.88262 14.9121C7.76965 14.6621 7.76891 14.3756 7.88062 14.125L8.62912 12.4459C8.75814 12.1564 8.75727 11.8256 8.62673 11.5369L4.20042 1.74577C4.10475 1.53416 3.89407 1.39819 3.66184 1.39819H0.457065C0.125461 1.39819 -0.0955218 1.74056 0.0410313 2.04275L4.35903 11.5977C4.47201 11.8477 4.47274 12.134 4.36111 12.3846L3.75 13.7561C3.63843 14.0065 3.6391 14.2926 3.75186 14.5425ZM21.6196 15.9874L15.3269 2.04252C15.1905 1.74036 15.4115 1.39819 15.743 1.39819H18.9366C19.1688 1.39819 19.3796 1.53416 19.4752 1.74577L23.9016 11.5369C24.0321 11.8256 24.033 12.1564 23.9039 12.4459L22.326 15.9858C22.1899 16.291 21.7571 16.292 21.6196 15.9874ZM2.26057 18.6823L3.77712 22.0435C3.89269 22.2997 3.70532 22.5898 3.4243 22.5898H0.410077C0.129822 22.5898 -0.0575409 22.3012 0.0565332 22.0452L1.55421 18.684C1.69024 18.3787 2.12314 18.3777 2.26057 18.6823ZM20.2415 20.8313L19.5922 22.2669C19.5033 22.4635 19.3076 22.5898 19.0918 22.5898H17.3523C17.1173 22.5898 16.9041 22.4522 16.8072 22.238L7.67348 2.04288C7.5368 1.74068 7.75779 1.39819 8.08946 1.39819H11.294C11.5262 1.39819 11.7369 1.53411 11.8326 1.74567L20.2415 20.3382C20.3124 20.495 20.3124 20.6746 20.2415 20.8313Z"
      fill={fill}
    />
  </Svg>
));

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
