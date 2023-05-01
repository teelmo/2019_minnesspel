import React, { useEffect, useState, useCallback } from 'react';
import '../styles/styles.less';

// https://underscorejs.org/
import _ from 'underscore';

let interval;
const used_words = [];
let timeout;
function App() {
  const [data, setData] = useState([]);
  const [dataAll, setDataAll] = useState([]);
  const [facebookLink, setFacebookLink] = useState('');
  const [hiddenInfo, setHiddenInfo] = useState(false);
  const [hiddenInput, setHiddenInput] = useState(true);
  const [hiddenNextButton, setHiddenNextButton] = useState(false);
  const [hiddenReadyButton, setHiddenReadyButton] = useState(true);
  const [hiddenRestartButton, setHiddenRestartButton] = useState(true);
  const [hiddenTimer, setHiddenTimer] = useState(true);
  const [hiddenWord, setHiddenWord] = useState(false);
  const [infoText, setInfoText] = useState('Kom ihåg orden på skärmen. När tiden är ute skriver du orden i rutorna som visas på skärmen. Om du vill kan du visa svarsrutorna direkt genom att trycka på stoppursbilden.');
  const [round, setRound] = useState(1);
  const [startText, setStartText] = useState('Börja spelet');
  const [timer, setTimer] = useState(9);
  const [timerStart, setTimerStart] = useState(9);
  const [twitterLink, setTwitterLink] = useState('');
  const [words, setWords] = useState([]);
  const [wordsCount, setWordsCount] = useState(3);

  const getDataPath = () => {
    if (window.location.href.includes('github')) return './assets/data/';
    if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2019_minnesspel/assets/data';
    return 'assets/data';
  };

  useEffect(() => {
    fetch(`${getDataPath()}/2019_minnesspel_data.json`).then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.text();
    }).then(body => {
      body = JSON.parse(body);
      setDataAll(body.data);
      setData(_.shuffle(body.data));
    });
  }, []);

  const reset = () => {
    setData(_.shuffle(dataAll));
    setHiddenInfo(true);
    setHiddenInput(true);
    setHiddenNextButton(false);
    setHiddenReadyButton(true);
    setHiddenRestartButton(true);
    setHiddenTimer(true);
    setHiddenWord(false);
    setInfoText('');
    setRound(1);
    setStartText('Börja spelet');
    setTimer(9);
    setTimerStart(9);
    setWords([]);
    setWordsCount(3);
  };

  const placeWords = useCallback(() => {
    const words1 = [];
    if (data.length > 0) {
      for (let i = 0; i < wordsCount; i++) {
        const word = data.shift();
        words1.push(word);
        used_words.push(word);
      }
    }
    setHiddenInfo(true);
    setHiddenInput(true);
    setHiddenNextButton(true);
    setHiddenTimer(false);
    setHiddenWord(false);
    setWords(words1);
    setWordsCount(((wordsCount + 1) > dataAll.length) ? dataAll.length : (wordsCount + 1));
  }, [data, dataAll.length, wordsCount]);

  const startInput = () => {
    clearInterval(interval);
    clearTimeout(timeout);
    setHiddenInput(false);
    setHiddenReadyButton(false);
    setHiddenTimer(true);
    setHiddenWord(true);
    setTimer(timerStart + 3);
    setTimerStart(timerStart + 3);
  };

  const showWords = () => {
    if (data.length < wordsCount) {
      setData(_.shuffle(dataAll));
    } else {
      placeWords();
    }
    timeout = setTimeout(() => {
      startInput();
    }, timer * 1000);
    interval = setInterval(() => {
      setTimer((t) => ((t - 1 < 0) ? 0 : t - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  };

  useEffect(() => {
    if (timer === 0) {
      clearInterval(interval);
      setHiddenTimer(true);
      setTimer(9);
    }
  }, [timer]);

  const checkWords = () => {
    let allow_to_continue = true;
    let incorrect_count = 0;
    let values_correct = [];
    _.each(document.querySelectorAll('#app-root-2019_minnesspel .inputs'), (element) => {
      values_correct.push(element.attributes['data-correct'].value);
    });
    _.each(document.querySelectorAll('#app-root-2019_minnesspel .inputs'), (element) => {
      if (_.contains(values_correct, element.value.trim().toLowerCase()) === true) {
        element.className = 'correct';
        element.value = element.value.trim();
        values_correct = _.without(values_correct, element.value.trim().toLowerCase());
      } else {
        incorrect_count++;
        allow_to_continue = false;
        element.className = 'incorrect';
        element.value = _.first(values_correct);
        values_correct = _.without(values_correct, element.value.trim().toLowerCase());
      }
    });
    if (allow_to_continue === true) {
      setHiddenInfo(false);
      setHiddenNextButton(false);
      setHiddenReadyButton(true);
      setInfoText(`Du kom till nivå ${round + 1}!`);
      setRound(round + 1);
      setStartText('Fortsätt');
    } else {
      const url = 'https://svenska.yle.fi/a/7-1412320';
      setFacebookLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://share.api.yle.fi/share/minnesspel/taso_${round}.html?url=${url.replace('https://svenska.yle.fi/', '')}`)}`);
      setHiddenInfo(false);
      setHiddenReadyButton(true);
      setHiddenRestartButton(false);
      setInfoText(`Äsch, ${incorrect_count} gick fel och spelet tog slut. Du kom till nivå ${round}!`);
      setTwitterLink(`https://twitter.com/share?url=${url}&hashtags=${encodeURIComponent('vetamix,yle,minnesspel')}&text=${encodeURIComponent(`Jag kom till nivå  ${round}!  i Vetamix minnestest. Testa hur bra du kommer ihåg ord.`)}`);
    }
  };

  const shareButton = (event) => {
    const specs = `top=${(window.screen.height / 2) - (420 / 2)},left=${(window.screen.width / 2) - (550 / 2)},toolbar=0,status=0,width=550,height=420`;
    window.open(event.currentTarget.href, 'Jaa', specs);
    event.preventDefault();
  };

  return (
    <div className="app">
      <h2>Minnesspel</h2>
      <div className="words_container">
        {words.map((word) => (
          <div className="word_container" key={word}>
            {!hiddenWord && <span className="word">{word}</span>}
            {!hiddenInput && <input data-correct={word} type="text" className="inputs" />}
          </div>
        ))}
      </div>
      {!hiddenInfo && <div className="info_container">{infoText}</div>}
      {!hiddenNextButton && <button className="button" onClick={() => showWords()} type="button">{startText}</button>}
      {!hiddenReadyButton && <button className="button" onClick={() => checkWords()} type="button">Svara</button>}
      {!hiddenTimer && <button className="timer_container" onClick={() => startInput()} type="button">{timer}</button>}
      {!hiddenRestartButton && (
      <div className="result_container">
        <div className="share_container">
          Dela resultatet på
          {' '}
          <a href={twitterLink} target="_blank" onClick={(event) => shareButton(event)} rel="noreferrer">Twitter</a>
          {' '}
          ja
          {' '}
          <a href={facebookLink} target="_blank" onClick={(event) => shareButton(event)} rel="noreferrer">Facebook</a>
          .
        </div>
        <div><button className="button" onClick={() => reset()} type="button">Spela en gång till!</button></div>
      </div>
      )}
    </div>
  );
}
export default App;
