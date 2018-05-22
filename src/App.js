import React, { PureComponent } from 'react'
import {ipcRenderer, remote} from 'electron'
import fs from 'fs'
import { PowerSettingsNew, Remove, PlayArrow, Pause, FastForward, FastRewind, VolumeUp, VolumeOff, RepeatOne, Shuffle } from 'material-ui-icons';

class App extends PureComponent {
  constructor(props){
    super(props)
    this.state = {
      path: '',
      songs: [],
      playing: false
    }
    this.init()
    this.window = remote.getCurrentWindow()
  }

  init(){
    ipcRenderer.on('open-file', (e, url) => {
      fs.readdir(url.slice(1), (err, files) => this.setState({
        songs: files,
        path: url.slice(1),
        active: files[0],
        current: 0,
        progress: 0,
        random: false,
        repeat: false,
        mute: false,
        autoplay: false
      }, () => {
        this.audio = document.createElement('audio')
        this.audio.src = `${this.state.path}/${this.state.active}`
        this.audio.autoplay = !!this.state.autoplay

        this.audio.addEventListener('timeupdate', e => {
          this.updateProgress()
        })
        this.audio.addEventListener('ended', e => {
          this.next()
        })
        this.audio.addEventListener('error', e => {
          this.next()
        })
      }))
    })
  }

  shuffle(arr){
    return arr.sort(() => Math.random() - 0.5)
  }

  updateProgress(){
    const { duration, currentTime } = this.audio
    const progress = (currentTime * 100) / duration

    this.setState({
      progress: progress,
    })
  }

  setProgress(e){
    const target = e.target.nodeName === 'SPAN' ? e.target.parentNode : e.target
    const width = target.clientWidth
    const rect = target.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const duration = this.audio.duration
    const currentTime = (duration * offsetX) / width
    const progress = (currentTime * 100) / duration

    this.audio.currentTime = currentTime

    this.setState({
      progress: progress,
    })

    this.play()
  }

  play(){
    this.setState({
      playing: true,
    })

    this.audio.play()
  }

  pause(){
    this.setState({
      playing: false,
    })

    this.audio.pause()
  }

  toggle(){
    this.state.playing ? this.pause() : this.play()
  }

  next(){
    const { repeat, current, songs } = this.state
    const total = songs.length
    const newSongToPlay = repeat
                          ? current
                          : current < total - 1
                            ? current + 1
                            : 0;
    const active = songs[newSongToPlay]

    this.setState({
      current: newSongToPlay,
      active: active,
      progress: 0,
      repeat: false,
    })

    this.audio.src = `${this.state.path}/${songs[newSongToPlay]}`
    this.play()
  }

  previous(){
    const { current, songs } = this.state
    const total = songs.length
    const newSongToPlay = current > 0 ? current - 1 : total - 1
    const active = songs[newSongToPlay]

    this.setState({
      current: newSongToPlay,
      active: active,
      progress: 0,
    })

    this.audio.src = `${this.state.path}/${songs[newSongToPlay]}`
    this.play()
  }

  randomize(){
    const { random, songs } = this.state
    const shuffled = this.shuffle(songs.slice())

    this.setState({
      songs: !random ? shuffled : songs,
      random: !random,
    })
  }

  repeat(){
    this.setState({
      repeat: !this.state.repeat,
    })
  }
    
  toggleMute(){
    const { mute } = this.state

    this.setState({
      mute: !mute,
    })

    this.audio.volume = !!mute
  }

  minimize(){
    this.window.minimize()
  }

  close(){
    this.window.close()
  }

  render() {
    const {
      active: currentSong,
      progress,
      playing,
      mute,
      random,
      repeat,
    } = this.state
    console.log(this.state)
    return (
      <div style={{height: '100%'}}>
        <div id='drag'>
          <div onClick={() => this.minimize()}><Remove color="secondary" /></div>
          <div onClick={() => this.close()}><PowerSettingsNew color="secondary" /></div>
        </div>

        <div id='wrap'>
          <div id="list">
            {this.state.songs.map((song, index) => {
              return(
                <div key={index} className='music-item'>
                  {song}
                </div>
              )
            })}
          </div>

          <div id="controls">

            <div className="player-progress-container" onClick={e => this.setProgress(e)}>
              <span className="player-progress-value" style={{width: progress + '%'}}></span>
            </div>
            <div onClick={() => this.toggle()} className="player-btn big" title="Play/Pause">
              {this.state.playing ? <Pause /> : <PlayArrow />}
            </div>
            <div onClick={() => this.previous()} className="player-btn medium" title="Previous Song"><FastRewind /></div>
            <div onClick={() => this.next()} className="player-btn medium" title="Next Song"><FastForward /></div>
            <div className="player-btn small volume" onClick={() => this.toggleMute()} title="Mute/Unmute">
              {this.state.mute ? <VolumeOff/> : <VolumeUp/>}
            </div>
            <div onClick={() => this.repeat()} title="Repeat"><RepeatOne /></div>
            <div onClick={() => this.randomize()} title="Shuffle"><Shuffle /></div>
          </div>
        </div>

      </div>
    )
  }
}

export default App
