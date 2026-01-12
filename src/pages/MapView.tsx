import { Map } from '../components/Map'
import styles from './MapView.module.css'

export default function MapView() {
  return (
    <div className={styles.container}>
      <Map />
    </div>
  )
}
