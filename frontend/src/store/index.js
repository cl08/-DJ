import Vue from 'vue'
import Vuex from 'vuex'
import menu from './modules/menu'
import axios from "axios";
import http from "../utils/http-common";
import http2 from "../utils/http-user";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    authorization:sessionStorage.getItem("authorization"),
    user : JSON.parse(sessionStorage.getItem('user')),
    visiblePlaylist: false,
    visiblePlayButton: true,
    visiblePauseButton: false,
    playlist: [],
    userPlayList: JSON.parse(sessionStorage.getItem('userPlayList')),     // 로그인하면 풀림, 유저랑 똑같이 세션에 박아놓겟음
    songLikeList: [],
    albumLikeList: [],
    playerControl: '',
    selectedSong: {
      index: -1,
      img: '',
      title: '',
      artist: '',
      src: '',
      lyric: '',
      currentTime: '',
      duration: '',
      volume: '',
      like: '',
      comment: '',
    },
    isLoggedin: sessionStorage.getItem('isLoggedin'),
  },
  getters: {
    config: (state) => ({headers: { Authorization: state.authorization }}),
    currentUser: (state) => state.user,
  },

  mutations: {
    SET_PLIST(state, { command, data }) {
      if (command === 'addAndPlay') {
        console.log(command)
        state.playerControl = 'add'
        state.playlist.unshift(data)
      } else {
        console.log(command)
        state.playerControl = ''
        state.playlist.push(data)
      }
    },
    SET_AUTH(state, value){
      sessionStorage.setItem("authorization", value)
      state.authorization = value
    },
    SET_USER(state, value) {
      sessionStorage.setItem("user", JSON.stringify(value))
      state.user = value
      state.songLikeList = value.like_songs
      state.albumLikeList = value.like_albums
      sessionStorage.setItem("isLoggedin", true)
      state.isLoggedin = true
    },
    SET_PLAYLIST(state, value) {
      state.userPlayList = value
      sessionStorage.setItem("userPlayList", JSON.stringify(value))
    },
    SET_SONG_LIKE(state, value) {
      state.songLikeList = value
    },
    LOGOUT(state){
      state.authorization=""
      state.user=null
      state.isLoggedin = false
      sessionStorage.removeItem("isLoggedin")
      sessionStorage.removeItem("authorization")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem('userPlayList')
    },
  },
  actions: {
    setLang({ commit }, payload) {
      commit('changeLang', payload)
    },
    setAuth({commit},value){
      commit('SET_AUTH',value)
    },
    setUser( { commit }, value) {
      commit('SET_USER', value)
    },
    setPlayList( { commit, getters } ) {
      http2.get('playlist/', getters.config)
      .then((res) => {
        commit('SET_PLAYLIST', res.data)
      })
    },
    logout({commit}){
      commit("LOGOUT")
    },
    async fetchYoutubeId({ commit }, song) {
      const youtubeURL = 'https://www.googleapis.com/youtube/v3/search'
      const API_KEY = process.env.VUE_APP_YOUTUBE_API_KEY
      const { data } = await axios.get(youtubeURL, {
        params: {
          key: API_KEY,
          part: 'snippet',
          maxResults: 1,
          type: 'video',
          q: song.artist[0].name + ' ' + song.name
        }
      })
      const { items } = data
      const { videoId } = items[0].id
      const reqData = {'src': videoId}
      song['src'] = videoId
      await http.post(`addsrc/${song.id}/`, reqData,'')
    },
    async addToPlaylistAndPlay({ commit, dispatch }, data) {
      let value = {
        'command': 'addAndPlay',
        'data': data
      }
      if (data['src']) {
        commit('SET_PLIST', value)
      } else {
        await dispatch('fetchYoutubeId', data)
        commit('SET_PLIST', value)
      }
    },
    async addToPlaylist({ commit, dispatch }, data) {
      let value = {
        'command': '',
        'data': data
        }
      if (data['src']) {
        commit('SET_PLIST', value)
      } else {
        await dispatch('fetchYoutubeId', data)
        commit('SET_PLIST', value)
      }
    },
    addToUserPlaylist(data, playlist, index) {
        http2
        .post(`playlist/${playlist.id}/song/`,{
          'songs': [data.id]
        },this.config)
        .then((value)=> {
          this.$notify('primary', "사용자 재생 목록에 추가 되었습니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
          this.userPlayList[index].song.push(data)
      })
    },



  },
  modules: {
    menu,
  }
})
