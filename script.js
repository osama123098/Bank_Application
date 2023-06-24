"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2023-06-20T17:01:17.194Z",
    "2023-06-24T23:36:17.929Z",
    "2023-06-23T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");


const display_date_movement = function(date,locale){
  const cal_day_passed = (date_1,date_2) => Math.round(Math.abs(date_1-date_2)/(1000*60*60*24));
  const day_passed = cal_day_passed(new Date(),date)
  if (day_passed ===0) return 'Today';
  if(day_passed===1) return 'Yesterday';
  if(day_passed<=7)return `${day_passed} days ago`;
  else{
    return new Intl.DateTimeFormat(locale).format(date);
  }    
}
const format_currency = function(value,locale,currency){
  return  new Intl.NumberFormat(locale,{
    style:'currency',
    currency:currency,
  }).format(value)
}
const print_movement = function (acc, sort_check = false) {
  containerMovements.innerHTML = "";
  // .textContent = 0

  const mov = sort_check
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  mov.forEach((move, i) => {
    const type = move > 0 ? "deposit" : "withdrawal";
    const date = new Date(acc.movementsDates[i]);

    const display_date =display_date_movement(date,acc.locale)
    const formatted_movement = format_currency(move,acc.locale,acc.currency)

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    }${type}</div>
      <div class="movements__date">${display_date}</div>
      <div class="movements__value">${formatted_movement}</div>
    </div> 
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const cal__print_Balance = function (account) {
  account.balance = account.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)} EUR`;
};
const cal_display_summary = function (acc) {

  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = format_currency(incomes,acc.locale,acc.currency)

  const out = acc.movements
    .filter((mov) => mov <= 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = format_currency(out,acc.locale,acc.currency)

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent =format_currency(interest,acc.locale,acc.currency)
};
const display_UI = function (acc) {
  //Display Balance
  cal__print_Balance(acc);

  //Display movements
  print_movement(acc);

  //Display Summary
  cal_display_summary(acc);
};

const create_user_name = function (accs) {
  accs.forEach(function (acc) {
    acc.user_name = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
create_user_name(accounts);

const start_logout_timer = function(){
  
  const tick =function(){
    const min =  String(Math.trunc(time/60)).padStart(2,0)
    const sec = String(time %60).padStart(2,0);
    // in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`
    
    //when timer is 0 logout user & stop timer
    if(time === 0){
      clearInterval(timer)
      labelWelcome.textContent = "Log In to Get Started..."
      containerApp.style.opacity = 0;
    }
    time--;
  };
  // set time to 5 minutes
  let time = 120

  //call the timer every second
  tick();
  const timer=setInterval(tick,1000)
  return timer;
}


//event handlers
let current_account,timer;
btnLogin.addEventListener("click", (e) => {
  //prevent from reloading the default behaviour of form tag
  e.preventDefault();
  current_account = accounts.find(
    (acc) => acc.user_name === inputLoginUsername.value
  );
  if (current_account?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome ${current_account.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    //current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day:'numeric',
      month: 'short',
      year:'2-digit',
      weekday: 'short',
    }
    
    labelDate.textContent = new Intl.DateTimeFormat(current_account.locale,options).format(now);
    timer = start_logout_timer();
    if (timer) clearInterval(timer);
     timer = start_logout_timer();
    // display UI
    display_UI(current_account);
  }
});

//amount transfer
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiver_account = accounts.find(
    (acc) => acc.user_name === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";
  if (
    amount > 0 &&
    current_account.balance >= amount &&
    receiver_account.user_name !== current_account.user_name
  ) {
    
    //add neg movement to current account
    current_account.movements.push(-amount);
    // add pos movement to receiver account
    receiver_account.movements.push(amount);
    //Add tranfer date to cuurent account
    current_account.movementsDates.push(new Date().toISOString());
    // Add tranfer date to receiver account
    receiver_account.movementsDates.push(new Date().toISOString());
    //display UI
    display_UI(current_account);
    //Reset the timer
    clearInterval(timer);
    timer = start_logout_timer();
  }
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  const pin = Number(inputClosePin.value);
  const user_name = inputCloseUsername.value;
  if (user_name === current_account.user_name && pin === current_account.pin) {
    const ind = accounts.findIndex((acc) => acc.user_name === user_name);
    //delete account
    accounts.splice(ind, 1);

    //hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    current_account.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function(){

    
    //add amount into account
    current_account.movements.push(amount);
    //add date to account
    current_account.movementsDates.push(new Date().toISOString());
    // update UI
    display_UI(current_account);
    },2500)
  }
  inputLoanAmount.value = "";
   //Reset the timer
   clearInterval(timer);
   timer = start_logout_timer();

});

let sort_check = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  print_movement(current_account, !sort_check);
  sort_check = !sort_check;
});


