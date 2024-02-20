import { Injectable, isDevMode } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface STORAGECHILD {
    SIGN: string; // SECRET SAUCE - MUST BE UNIQUE
    TYPE: string;
    Description?: {
        short: string;
        long: string;
    };
    domestic?: boolean;
}

/**
 * Storage Box Service - KodBox
 *  - This is meant to simplify communication between components
 *
 */
@Injectable({
    providedIn: 'root'
})
export class KodBoxService {


    // Lets create a dynamic object that can be used to store all the properties
    private storageBoxProperty: any = {};
    private lambdaProperty: any = {};
    private _sBoxObservable: BehaviorSubject<any> = new BehaviorSubject<any>(this.storageBoxProperty);

    sBoxObservable$: Observable<any> = this._sBoxObservable.asObservable();

    constructor() { }

    // -----------------------------------------------------------------------------------------------------
    // @ Private mutation methods
    // -----------------------------------------------------------------------------------------------------

    // safe guard to prevent a loop
    private firewallSetOnceOpened: boolean = false;

    private setStorageBox(newStorageBox:any, beingSet: boolean = false): void {
        // lets set the peristence of the property
        if (beingSet && this.firewallSetOnceOpened) {
            this.firewallSetOnceOpened = false;
            this.savePersistence(newStorageBox);
        }
        this._sBoxObservable.next(newStorageBox);
    }
    private savePersistence(newStorageBox:any): void {
        // if(isDevMode)console.log("Saving StorageBox Properties to Session Storage");
        // if(isDevMode)console.log("Origin of Persistence Save is : ", newStorageBox?.user?.iComeFrom);
        sessionStorage.setItem('StorageBox', JSON.stringify(newStorageBox));
    }
    private async savePersistenceAsync(newStorageBox:any): Promise<void> {
        return new Promise<void>(resolve => {
            // if(isDevMode)console.log("Saving StorageBox Properties to Session Storage");
            // if(isDevMode)console.log("Origin of Persistence Save is : ", newStorageBox?.user?.iComeFrom);
            var savedStorageBox = JSON.stringify(newStorageBox);
            sessionStorage.setItem('StorageBox', savedStorageBox );
            return resolve();
        });
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public mutation methods
    // -----------------------------------------------------------------------------------------------------

    // allow for an object key to be passed back with the value
    getProperty(key: string): any {
        return this.storageBoxProperty[key];
    }

    // allow for an object key to be passed in and set the value
    setProperty(key: string, value: any): void {
        this.storageBoxProperty[key] = value;
    }
    setLambda(functionName: string, bindedFunctionReference: any): void {
        if(isDevMode())console.warn("\t\tBinding Function { " + functionName + " } to the lambdaProperty object");
        this.lambdaProperty[functionName] = bindedFunctionReference;
    }
    get(key: string): any {
        if (this.storageBoxProperty.hasOwnProperty(key)) {
            return this.storageBoxProperty[key];
        } else {
            // lets check the session storage
            if (sessionStorage.getItem('StorageBox')) {
                // search the session storage before restoring it
                let storageBoxProperties = JSON.parse(sessionStorage.getItem('StorageBox')!);
                if (storageBoxProperties.hasOwnProperty(key)) {
                    // lets set the storageBox properties to the session storage
                    this.storageBoxProperty = JSON.parse(sessionStorage.getItem('StorageBox')!);
                    this.firewallSetOnceOpened = true;
                    this.setStorageBox(this.storageBoxProperty, true);
                    return this.storageBoxProperty[key];
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
    }
    set(key: string, value: any, readonly: boolean = false, updatePersitence: boolean = false): void {

        if (!readonly) {
            this.storageBoxProperty[key] = value;
        } else {
            Object.defineProperty(this.storageBoxProperty, key, {
                value: value,
                writable: false,
                enumerable: true,
                configurable: true
            });
        }

        if (updatePersitence) {
            this.savePersistence(this.storageBoxProperty);
        }
        this.setStorageBox(this.storageBoxProperty); // automatically update the observable
    }
    async setAsync(key: string, value: any, readonly: boolean = false, updatePersitence: boolean = false, refreshPersistence: boolean = false): Promise<void> {
        return new Promise<void>(async resolve => {
            if (!readonly) {
                this.storageBoxProperty[key] = value;
            } else {
                Object.defineProperty(this.storageBoxProperty, key, {
                    value: value,
                    writable: false,
                    enumerable: true,
                    configurable: true
                });
            }

            if (updatePersitence) {
                // Might not be necessary since in setStorageBox we are saving the persistence
                if(refreshPersistence){
                    // Destroy the current storage box
                    sessionStorage.removeItem('StorageBox')
                }
                await this.savePersistenceAsync(this.storageBoxProperty);
            }
            this.setStorageBox(this.storageBoxProperty); // automatically update the observable
            return resolve();
        });
    }
    // Domestic Properties are reserved for methods and functions
    lambda(bindedFunctionName: string): any {
        if (this.lambdaProperty.hasOwnProperty(bindedFunctionName)) {
            return this.lambdaProperty[bindedFunctionName];
        } else {
            console.error("\tFunction " + bindedFunctionName + " does not exist inside the lambdaProperty object, maybe it was never bound?");
        }
    }
    async lambdaAsync(key: string): Promise<any> {
        return this.lambdaProperty[key];
    }

    // check if the key exists in the storageBoxProperty object and lambdaProperty object
    has(key: string): boolean {
        return this.storageBoxProperty.hasOwnProperty(key) || this.lambdaProperty.hasOwnProperty(key);
    }
    // checks if the signature is bound to a function as well as a property
    binded(key: string): boolean {
        return this.storageBoxProperty.hasOwnProperty(key) && this.lambdaProperty.hasOwnProperty(key);
    }

    update() {
        // ? should we null out the storageBoxProperty object?
        // ? and then reset it to the original values? hmmm...
        this.setStorageBox(this.storageBoxProperty);
    }

    /**
     * Async Function of Observable Update
     * Function will perform a observable update for
     * storage values inside the storageBox object.
     *
     * (pass in a boolean of true to rewrite the Session Storage as well)
     */
    async updateAsync(rewriteSessionStorage: boolean = false): Promise<void> {
        if (rewriteSessionStorage) {
            this.firewallSetOnceOpened = true;
        }
        this.setStorageBox(this.storageBoxProperty, rewriteSessionStorage);
    }

    // Note : If we delete a property we might want to remove it from the session storage as well
    remove(key: string, destroy: boolean = false): void {
        if (destroy) {
            delete this.storageBoxProperty[key];
        } else {
            const propertyDescriptor = Object.getOwnPropertyDescriptor(this.storageBoxProperty, key);
            if (propertyDescriptor && propertyDescriptor.writable) {
                delete this.storageBoxProperty[key];
            } else {
                console.error(key, " Property is readonly. Cannot be removed.");
            }
        }
    }

    // destroy the storageBoxProperty object and empty session storage
    destroy(): void {
        this.storageBoxProperty = {};
        this.lambdaProperty = {};
        sessionStorage.removeItem('StorageBox');
        this.setStorageBox(this.storageBoxProperty);
    }

    // print the storageBoxProperty object contents to the console
    print(detailed: boolean = false, printData: boolean = false): any {

        if (detailed) console.log(Object.getOwnPropertyDescriptors(this.storageBoxProperty));

        Object.keys(this.storageBoxProperty).forEach(key => {
            if (printData) {
                if (detailed) console.log(Object.getOwnPropertyDescriptor(this.storageBoxProperty, key));
                console.log(key, this.storageBoxProperty[key]);
            } else {
                if (detailed) {
                    console.log("StorageBox Property : ", key, "\n", Object.getOwnPropertyDescriptor(this.storageBoxProperty, key));
                } else {
                    console.log("StorageBox Property : ", key);
                }
            }
        });
    }


}
