type TPromiseResolve<T> = (value?: T) => void;
type TPromiseReject<K> = (reason?: K) => void;

type TPromiseExecutor<T, K> = (
  resolve: TPromiseResolve<T>,
  reject: TPromiseReject<K>,
) => void;

type TPromiseThenCallback<T> = (value: T | undefined) => void;
type TPromiseCatchCallback<K> = (reason: K | undefined) => void;
type TPromiseFinallyCallback = () => void;

enum PromiseState {
  PENDING = "pending",
  FULFILLED = "fulfilled",
  REJECTED = "rejected",
}

class MyPromise<T, K> {
  private _state: PromiseState = PromiseState.PENDING;
  private _successCallbackHandlers: TPromiseThenCallback<T>[] = [];
  private _failureCallbackHandlers: TPromiseCatchCallback<K>[] = [];
  private _finallyCallbackHandlers: TPromiseFinallyCallback | undefined =
    undefined;
  private _value: T | undefined = undefined;
  private _reason: K | undefined = undefined;

  constructor(executor: TPromiseExecutor<T, K>) {
    executor(
      this._promiseResolver.bind(this),
      this._promiseRejecter.bind(this),
    );
  }

  public then(handlerFn: TPromiseThenCallback<T>) {
    if (this._state === PromiseState.FULFILLED && this._value !== undefined) {
      handlerFn(this._value);
    } else {
      this._successCallbackHandlers.push(handlerFn);
    }
    return this;
  }
  public catch(handlerFn: TPromiseCatchCallback<K>) {
    if (this._state === PromiseState.REJECTED && this._reason !== undefined) {
      handlerFn(this._reason);
    } else {
      this._failureCallbackHandlers.push(handlerFn);
    }
    return this;
  }
  public finally(handlerFn: TPromiseFinallyCallback) {
    if (this._state !== PromiseState.PENDING) {
      handlerFn();
    } else {
      this._finallyCallbackHandlers = handlerFn;
    }
    return this;
  }

  private _promiseResolver(value: T | undefined) {
    if (this._state !== PromiseState.PENDING) return;
    this._state = PromiseState.FULFILLED;
    this._value = value;
    if (value !== undefined) {
      this._successCallbackHandlers.forEach((cb) => cb(value));
    }
    if (this._finallyCallbackHandlers) {
      this._finallyCallbackHandlers();
    }
  }

  private _promiseRejecter(reason: K | undefined) {
    if (this._state !== PromiseState.PENDING) return;
    this._state = PromiseState.REJECTED;
    this._reason = reason;
    if (reason !== undefined) {
      this._failureCallbackHandlers.forEach((cb) => cb(reason));
    }
    if (this._finallyCallbackHandlers) {
      this._finallyCallbackHandlers();
    }
  }
}

function customPromise() {
  return new MyPromise<number, string>((resolve, reject) => {
    resolve(1);
    // reject("Error occurred");
  });
}

const p1 = customPromise()
  .then((value) => {
    console.log(value);
  })
  .catch((reason) => {
    console.error(reason);
  })
  .finally(() => {
    console.log("Finally block executed");
  });
