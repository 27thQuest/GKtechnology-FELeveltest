import './style/index.scss';
import React, { useState, useEffect } from 'react';
import { TokenSelector } from './component/TokenSelector';
import { ResultTokenSelector } from './component/ResultTokenSelector';
//Calling currency info
import currencyData from './currency.json';
type Currency = keyof typeof currencyData.currencies;

const Main: React.FC = () => {

//Dropdown menu opening functions________________________________________________________________________
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [isReceiveTokenSelectorOpen, setIsReceiveTokenSelectorOpen] = useState(false);
//Dropdown menu closing functions
  const toggleTokenSelectorOpen = () => setIsTokenSelectorOpen(!isTokenSelectorOpen);
  const toggleReceiveTokenSelectorOpen = () => setIsReceiveTokenSelectorOpen(!isReceiveTokenSelectorOpen);

//Setting up "You pay" and "You receive" currencies______________________________________________________
  const [payCurrency, setPayCurrency] = useState<Currency>('CTC');
  const [receiveCurrency, setReceiveCurrency] = useState<Currency | null>(null);

//Fetchnig user balance information (API 1)________________________________________________________________________
  const [payBalance, setPayBalance] = useState<Record<string, string> | null>(null);
  useEffect(() => {
  fetch("https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-balance")
    .then(res => res.json())
    .then(data => setPayBalance(data))
    .catch(err => console.error(err));
}, []);
  const currentPayBalance = payBalance ? payBalance[payCurrency] : 0;  

  const [receiveBalance, setReceiveBalance] = useState<Record<string, string> | null>(null);
  useEffect(() => {
  fetch("https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-balance")
    .then(res => res.json())
    .then(data => setReceiveBalance(data))
    .catch(err => console.error(err));
}, []);
const currentReceiveBalance = receiveBalance && receiveCurrency ? receiveBalance[receiveCurrency]: 0;

//Fetching currency value (API 2)________________________________________________________________________
  const [payCurrencyValue, setPayCurrencyValue] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    fetch("https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-price")
      .then(res => res.json())
      .then(data => setPayCurrencyValue(data))
      .catch(err => console.error(err));
  }, []);  
  const currentPayCurrencyValue = payCurrencyValue ? payCurrencyValue[payCurrency] : 0;

  const [receiveCurrencyValue, setReceiveCurrencyValue] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    fetch("https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-price")
      .then(res => res.json())
      .then(data => setReceiveCurrencyValue(data))
      .catch(err => console.error(err));
  }, []);  
  const currentReceiveCurrencyValue = receiveCurrencyValue && receiveCurrency ? receiveCurrencyValue[receiveCurrency]: 0;

//Posting API 3_____________________________________________________________________________________________
  const handleSwap = async () => {
  try {
    const res = await fetch(
      "https://inhousedashboard-test-app.azurewebsites.net/api/Interview/post-swap",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payCurrency,                 // e.g. "CTC"
          receiveCurrency,             // e.g. "USDC"  (must NOT be null)
          amount: Number(payAmount),   // number
        }),
      }
    ); if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`post-swap failed ${res.status} ${text}`);
    }
    const data = await res.json().catch(() => ({}));
    console.log("swap success:", data);

    setPayAmount("");
  } catch (err) {
    console.error("swap error:", err);
  }
}; 
const [payAmount, setPayAmount] = useState("");

//Calculating amount received________________________________________________________________________
  const receiveAmount =
  receiveCurrencyValue
    ? Number(payAmount) * (Number(currentPayCurrencyValue) / Number(currentReceiveCurrencyValue))
    : 0;

//Function for swap button________________________________________________________________________
  const swapCurrencies = () => {
    if (!receiveCurrency) return;
    console.log("swapped")
    setPayCurrency(receiveCurrency);
    setReceiveCurrency(payCurrency);
    setPayAmount(String(receiveAmount));
  };




  return (
    <>
      <div>
        <section className="page swap-page">
          <div className="box-content">
            <div className="heading">
              <h2>Currency Swap</h2>
            </div>

            <div className="swap-dashboard">
              <div className="swap-item active">
                <div className="title">
                  <h3>You pay</h3>
                </div>

                <div className="amount-input">
                  <div className="input">
                    <input type="number"
                      placeholder='0'
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)} />
                  </div>

                  <button type="button" className="currency-label" onClick={toggleTokenSelectorOpen}>
                    <div className={`token ${String(payCurrency)}`} data-token-size="28"></div>
                    <strong className="name">{String(payCurrency)}</strong>
                  </button>
                </div>

                <div className="amount item-flex">
                  <div className="lt">
                  </div>
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {currentPayBalance}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" className="mark" onClick={() => swapCurrencies()}>
                <i className="blind">swap</i>
              </button>

              <div className="swap-item">
                <div className="title">
                  <h3>You receive</h3>
                </div>

                <div className="amount-input">
                  <div className="input">
                    {receiveCurrency ? (<span className="amount-value"> {receiveAmount || 0} </span>):(<span className="amount-value"> Select Token </span>)}
                    
                  </div>
                  {receiveCurrency ? (
                    <button type="button" className="currency-label select" onClick={toggleReceiveTokenSelectorOpen}>
                      <div className={`token ${receiveCurrency}`} data-token-size="28"></div>
                      <strong className="name">{receiveCurrency}</strong>
                    </button>
                  ) : (
                    <button type="button" className="currency-label select" onClick={toggleReceiveTokenSelectorOpen}>
                      Select token
                    </button>
                  )}
                </div>

                <div className="item-flex amount">
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {currentReceiveBalance}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-wrap">
                {Number(payAmount)<Number(currentPayBalance) ?(<button type="button" className="normal" disabled={false} onClick={() => handleSwap()}>
                  Swap
                </button>
              ):(
                <button type="button" className="normal" disabled={true} onClick={() => { console.log("wow") }}>
                  Swap
                </button>
              )}

              </div>

            </div>
          </div>
        </section>
      </div>

      {isTokenSelectorOpen && (
        <TokenSelector
          onClose={() => setIsTokenSelectorOpen(false)}
          onSelectToken={token => {
            setPayCurrency(token);
            setIsTokenSelectorOpen(false);
          }} />
      )}

      {isReceiveTokenSelectorOpen && (
        <ResultTokenSelector
          onClose={() => setIsReceiveTokenSelectorOpen(false)}
          onSelectReceiveToken={receiveToken => {
            setReceiveCurrency(receiveToken);
            setIsReceiveTokenSelectorOpen(false);
          }} />
      )}
    </>
  );
}

export { Main as default };
