import { History } from "./base";

class BrowserHistory extends History {
  constructor(router) {
    super(router)
    this.router = router
  }
}

export default BrowserHistory