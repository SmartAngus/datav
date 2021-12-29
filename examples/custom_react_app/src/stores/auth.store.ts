import {observable, action, makeObservable} from 'mobx';

export class AuthStore{
    @observable inProgress = false;
    @observable errors = undefined;

    @observable values = {
        username: '',
        email: '',
        password: '',
    };
    constructor() {
        // mobx6.0后的版本都需要手动调用makeObservable(this)，不然会发现数据变了视图不更新
        // https://juejin.cn/post/6959866447157788708
        makeObservable(this);
    }

    @action setUsername(username:string) {
        this.values.username = username;
    }

    @action setEmail(email: string) {
        this.values.email = email;
    }

    @action setPassword(password: string) {
        this.values.password = password;
    }

    @action reset() {
        this.values.username = '';
        this.values.email = '';
        this.values.password = '';
    }

    // @action login() {
    //     this.inProgress = true;
    //     this.errors = undefined;
    //     return agent.Auth.login(this.values.email, this.values.password)
    //         .then(({ user }) => commonStore.setToken(user.token))
    //         .then(() => userStore.pullUser())
    //         .catch(action((err) => {
    //             this.errors = err.response && err.response.body && err.response.body.errors;
    //             throw err;
    //         }))
    //         .finally(action(() => { this.inProgress = false; }));
    // }
    //
    // @action register() {
    //     this.inProgress = true;
    //     this.errors = undefined;
    //     return agent.Auth.register(this.values.username, this.values.email, this.values.password)
    //         .then(({ user }) => commonStore.setToken(user.token))
    //         .then(() => userStore.pullUser())
    //         .catch(action((err) => {
    //             this.errors = err.response && err.response.body && err.response.body.errors;
    //             throw err;
    //         }))
    //         .finally(action(() => { this.inProgress = false; }));
    // }
    //
    // @action logout() {
    //     commonStore.setToken(undefined);
    //     userStore.forgetUser();
    //     return Promise.resolve();
    // }
}
export default new AuthStore();
