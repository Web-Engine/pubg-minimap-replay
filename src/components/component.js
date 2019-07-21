import { Container } from 'pixi.js';

class Component extends Container {
    constructor() {
        super();

        this.root = null;

        let onRootChange = () => {
            let root = this.parent;

            while (root.parent) {
                root = root.parent;
            }

            if (this.root) {
                this.root.off('added', onRootChange);
            }

            root.on('added', onRootChange);

            this.root = root;
        };

        this.on('added', onRootChange);

        this.on('removed', () => {
            this.root.off('added', onRootChange);

            this.root = null;
        });
    }
}

export default Component;
