import React from 'react';
import AppWrapper from './src/components/AppWrapper';
import { withPerformanceTracking } from './src/utils/performance';

const App = () => {
  return <AppWrapper />;
};

export default withPerformanceTracking(App, 'App');
