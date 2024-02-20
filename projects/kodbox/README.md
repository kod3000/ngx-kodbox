# KodBox Service 
*(Angular Version, Optimized for Ivy Angular 17)*

KodBox is an Angular service designed to facilitate communication and state management across components within an Angular application. 

<br />

KodBox primary goal is to simplify communication between components in an Angular application. By managing shared state and providing a central point for function execution and state persistence, it helps in creating a more maintainable and scalable application architecture. The service abstracts away the complexities of direct component-to-component communication and state management, allowing developers to focus on business logic and application development.

<br />


## Two Core Concepts .::Storage::..&&..::Lambda::.

The key features to focus on are Dynamic Property Management for Object Storage and Lambda Function Extension. These two concepts make this service a powerhouse for any developer looking to simplify complexity for their project.  

<br />


### Storage Box (Dynamic Object Storage)

The service is made to maintain a dynamic object (storageBoxProperty) for state management, allowing for flexible setting and retrieval of properties using key-value pairs. This approach enables the dynamic addition and modification of the state at runtime, catering to various state management needs within an application.


#### Storage Box Objects :
 - Requirements : must have a string name (or an enum value) for later reference
 - Can be anything ( value, interface, class, etc. )
 - Bonus : Eveything inside the Storage Box object is an observable
 - Storage Box objects are also saved in Session (page reload safe)

<br />

*Developer Note : Careful to NOT set a function to Storage Box object. Doing so WILL create a circular referece, as all Storage Box objects are set to be observable. Lambda Box exist for this very reason, (use a Lambda Box object instead)*

<br />

**Quick Look : Setting a variable to use inside Storage Box**

    // declare the service object inside your class constructor
    constructor(private _kodBx : KodBoxService)

    // create data object example any value 'hello world'
    
    // tradition method 
    var hello_world : string = "hello world";
    // output : "hello world"

    // same thing but using kodBx to hold your string
    this._kodBx.set("my_key_hello", "hello world") // key, value
    // output : "hello world"


    // or ..
    this._kodBx.set("My human readable key for hello!", "hello world") // key, value
    // output : "hello world"


**Quick Look : Getting a variable from Storage Box**


    // getting a variable is straight forward ..
    // to retreieve any value, all you need 
    // is the key used to store that value
    this._kodBx.get("my_key_hello") 

*As long as the value has been set, it can be retieved from anywhere the KodBoxService is called.*

<br />

You can check if the value exist by checking if the key itself exists.. (if the key doesn't exist then the value was never/ or has not yet to been set.) You can check this by using the *has* function on kodbox

**Quick Look : Checking if a variable has been set inside Storage Box**

    // The has function will return a boolean if the key exist or not 
    this._kodBx.has("my_key_hello")

<br />
<br />

---

<br />
<br />

### Lambda Box (Function Extension)

Similarly, it manages a separate object (lambdaProperty) to store references to functions. This allows for dynamic binding of functions, enabling components to execute functions stored in the service context. This feature is particularly useful for sharing logic and handlers across different parts of the application.


#### Lambda Box Functions :
 - Same Requirements as Storage Box
 - As mentioned Lambda Box objects are NOT observable
 - Paramerters can be passed into lambda functions.
 - Functions exist for as long as the housing component does.


<br />

**Quick Look : Binding a Lambda Box**

    // declare the service object inside your class constructor
    constructor(private _kodBx : KodBoxService){
        
        // bind any method to the lambda box extension 

        // bind a private method
        this._kodBx.setLambda('foo_bar', this.fooBar.bind(this)) // key, value

        // bind a public method
        this._kodBx.setLambda('foo_foo', this.foo.bind(this)) // key, value

    }

    // method is private inside your class
    private fooBar(value:string){
        console.log('hello ' + value);
    }

    // method is public inside your class
    public foo(){
        console.log('hello public world');
    }



**Quick Look : Calling a binded Method from Lambda Box**


    // to call any binded function, all you need 
    // is the key used to bind that function ..

    // take note if the function uses params you can pass them in as well..
    this._kodBx.lambda("foo_bar")("John Jingle Smith"); // call a private function
    // output : "hello John Jingle Smith"

    this._kodBx.lambda("foo")(); // call a public function 
    // output : "hello JohnJiggle"



<br />

----

<br />

<br />


## Going Further

Beyond data storage and function managment, there are a variety of underlying mechanizms that can be used to create a more powerful application.

<br />




### StorageBox as an << Observable >>

*You can treat the StorageBox as any other observable.* 

<br />


There are two commands that are reserved to *update* the observable, asyncornous and non-async. Depending on your needs both will perform the emit function for the observable.


**Quick Look : Performing an update command to the Storage Box object observable**

    this._kodBx.update() // 1. will fire the observable emit function

    await this._kodBx.update() // 2. will perform the emit async


*Developer Note : StorageBox is meant to hold data, if you modify the data
inside the storage box, you must call the update function to
fire the observable emit to update it throughout the app.*

<br />



### Lambda Box as << async/await >>
*You can bind async functions, and call await onto the Lambda Box.* 

<br />

**Quick Look : Example Async Function**

    // Lets say you need to call this function at a later time 
    // from somewhere outside the existing class.
    // 

    private async _rebuildUser(originOfCall?:string){
        ......
        ........
        ......
    }

**Quick Look : Example How to Bind The Above Async Function**

    this._kodBx.setLambda("user", this._rebuildUser.bind(this))

**Quick Look : Example How to Call the Async Function**

    await this._kodBx.lambda('user')("sign-in-component");


<br />

The Lambda object is not observable and has added function to be async 

**Quick Look : All Lambda Box functions have added function to be async**

    // normal lambda call 
    this._kodBx.lambda('foo')

    // async lambda call
    await this._kodBx.lambdaAsync('foo')

<br />
<br />




### Debugging Tools


#### Print function
*will give console out display of the complete storage box object*

<br />

**Quick Look : Debug helper function gives what kind of types are being used**
    
    // Gives detail data that is inside each object this will give that info

    // Takes two optional parameters ( detailed:boolean, printData:boolean) 

    this._kodBx.print();
<br />
<br />


#### isDevMode()

Development mode includes warnings for function bindings to alert developers to potential misuses or debug issues with Lambda function bindings.


<br />





<br />
<br />

# Troubleshooting

<br />

Hmmm... if you are in trouble, I'm happy to help anyway that can...

Currently, I do not have any example files created but if you feel like this would help you on your coding journey, I'd be glad to draw some up. Please feel free to open a new issue and I'll be sure to create some more example material on how to use this package.

Also, I'm aware that there are other features that the package uses that are not yet documented.

Now. If you find any other issues, again.. please open an issue and I'll address it in a timely manner.
<br />

<br />
<br />


# Contribution

All contributions very welcome! And remember, contribution is not only PRs and code, but any help with docs or helping other developers to solve issues are very appreciated! Thanks in advance!


License
MIT


Thanks for linking up and really hope this package was useful to your needs. Please throw a Star if this was the case. Best of everything! Happy Coding!!!