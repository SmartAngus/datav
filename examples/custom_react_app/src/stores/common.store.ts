import { observable, action, reaction, makeObservable } from 'mobx';

export class CommonStore {

    @observable appName = 'Conduit';
    @observable token = window.localStorage.getItem('jwt');
    @observable appLoaded = false;

    @observable tags: string[] = [];
    @observable isLoadingTags = 'majy';

    constructor() {
        // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
        // https://juejin.cn/post/6959866447157788708
        makeObservable(this);
        reaction(
            () => this.token,
            token => {
                if (token) {
                    window.localStorage.setItem('jwt', token);
                } else {
                    window.localStorage.removeItem('jwt');
                }
            }
        );
    }

    @action loadTags() {
        console.log('+++++执行了loadTags方法++++')
        this.isLoadingTags = 'assads';
        return []
    }

    @action setToken(token: string | null) {
        this.token = token;
    }

    @action setAppLoaded() {
        this.appLoaded = true;
    }

}

export default new CommonStore();
