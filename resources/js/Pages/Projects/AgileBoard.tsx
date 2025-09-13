import React from 'react';
import AgileBoard from '@/Components/Projects/AgileBoard';

export default function AgileBoardPage(props) {
  // All Agile data should be passed via props from the controller
  return <AgileBoard {...props} />;
}
