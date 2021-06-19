import { folder, useControls } from 'leva'
import shallow from 'zustand/shallow'

import { levaList } from '@/libs/ui/leva-list'

import useCustomizing from '@/helpers/customizing'
import useParameters from '@/helpers/parameters'

import Sections from './inline-icons-pony/index'

import styles from '@/styles/editor.module.css'

export default function Customization() {
  const [config, setConfig] = useCustomizing(
    (state) => [state.config, state.setConfig],
    shallow
  )

  const [setColor, setName, setBoolean, setProperty] = useParameters(
    (state) => [
      state.setColor,
      state.setName,
      state.setBoolean,
      state.setProperty,
    ],
    shallow
  )

  useControls(() => {
    const values = {}

    const { colors, booleans, names, properties } = useParameters.getState()

    function createValues({
      label,
      value,
      color,
      boolean,
      list,
      min,
      max,
      step,
      imgSrc,
    }) {
      let valueObj = {}

      function createValue(value, onChange) {
        return { label, value, onChange }
      }

      if (list) {
        valueObj = levaList({
          value: names[value],
          list,
          src: imgSrc,
          change: (valueIn, index) => setName(value, valueIn, index),
        })
      } else if (boolean) {
        valueObj = createValue(booleans[boolean], (valueIn) =>
          setBoolean(boolean, valueIn)
        )
      } else if (color) {
        valueObj = createValue(colors[color], (valueIn) => {
          setColor(color, valueIn)
        })
      } else if (value) {
        valueObj = createValue(properties[value], (valueIn) =>
          setProperty(value, valueIn)
        )
      }

      if (min) valueObj.min = min
      if (max) valueObj.max = max
      if (step) valueObj.step = step

      return valueObj
    }

    for (const label in config) {
      if (config[label].folder) {
        const group = {}

        for (const labelInner in config[label].folder) {
          group[labelInner] = createValues(config[label].folder[labelInner])
        }

        values[label] = folder(group, { collapsed: true })
      } else {
        values[label] = createValues(config[label])
      }
    }

    return values
  }, [config, setColor, setName, setBoolean, setProperty])

  return (
    <ul className={styles['right-bar']}>
      {Sections.map((Component, key) => (
        <li key={key} onClick={() => setConfig(key)}>
          <Component />
        </li>
      ))}
    </ul>
  )
}
