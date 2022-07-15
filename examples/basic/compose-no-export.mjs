import composer from 'module-composer';
import modules from './modules/index.mjs';

const { compose } = composer(modules);
const { stores } = compose('stores');
const { services } = compose('services', { stores });
const { components } = compose('components', { services });