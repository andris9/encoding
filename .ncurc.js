'use strict';

module.exports = {
    upgrade: true,
    target: name => {
        // iconv-lite is the only runtime dependency and this package has millions of weekly
        // downloads, many from very old consumers. Moving to a new 0.x line (0.7) changes what
        // every one of them installs, so it has to be a deliberate change, not a side effect of
        // npm run update. Stay on 0.6.x patches until that decision is made.
        if (name === 'iconv-lite') {
            return 'patch';
        }
        return 'latest';
    }
};
