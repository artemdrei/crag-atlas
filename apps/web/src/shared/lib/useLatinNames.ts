import { useEffect, useRef, useState } from 'react';

import {
  followLatin,
  isNameLatin,
  loadTransliteration,
  toLatin
} from './toLatin';

export const useLatinNames = (initialName = '', initialLocal = '') => {
  const [name, setName] = useState(initialName);
  const [nameLocal, setNameLocal] = useState(initialLocal);
  const nameLocalRef = useRef(nameLocal);

  nameLocalRef.current = nameLocal;

  // A local name typed before the charmap arrived leaves the Latin box empty,
  // so it is filled once — never over something already written there.
  useEffect(() => {
    void loadTransliteration().then(() =>
      setName((current) =>
        current ? current : (toLatin(nameLocalRef.current) ?? current)
      )
    );
  }, []);

  return {
    name,
    nameLocal,
    isNameLatin: isNameLatin(name),
    setName,
    setNameLocal: (value: string) => {
      const next = followLatin(name, nameLocal, value);

      setNameLocal(next.nameLocal);
      setName(next.name);
    },
    // Both boxes at once, past the rule above: a revert restores what was
    // saved even where the Latin name was written by hand.
    resetNames: (nextName = '', nextLocal = '') => {
      setName(nextName);
      setNameLocal(nextLocal);
    }
  };
};
