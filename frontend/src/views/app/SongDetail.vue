<template>
  <div>
    <b-row>
      <b-colxx xxs="12">
        <div class="separator mb-5"></div>
      </b-colxx>
    </b-row>
    <b-row>
      <b-colxx xxs="12">  
        <b-colxx xxs="12" class="mb-4 pl-3 pr-3" style="display: inline-flex;">
                <div xxs="4" class="card mb-4"  style="width:30%; margin-right:3%">
                  <img class="card-img-top" :src="song.img" style="border-top-left-radius:initial; border-top-right-radius:initial"/>
                </div>
                <div xxs="8" style="width:70%;">
                  <h1 class="mb-0 truncate text-xlarge" style="margin-top:3%">{{song.name}}</h1><br>
                  <h1 class="mb-0 truncate text-large"><a v-for="(singer, index) in song.artist" v-bind:key="index"><router-link :to="'/A505/artistDetail/'+singer.id" class="text-primary mr-3 ">{{singer.name}}</router-link></a></h1><br>
                  <h2 class="mb-0 truncate" v-if="song.album">앨범: <router-link :to="'/A505/albumDetail/'+song.album.id" class="text-primary">{{song.album.name}}</router-link></h2><br>
                  <h3 class="mb-0 truncate " style="display: inline-flex;">장르:<h3 class="ml-1" v-for="(genre, index) in song.genres" v-bind:key="index"> {{genre.name}}</h3></h3><br>
                  <h3 class="mb-0 truncate">감정: {{song.type}}</h3>
                  <h1 v-if="!checkLikeSong() && this.song.user_like" class="mb-0 truncate mt-5 text-large glyph-icon" style="cursor:pointer;" @click="likeSong(song.id)"><img src="../../assets/img/heart/heart_empty.png" style="width:32px;vertical-align:top;"/> {{this.song.like + this.song.user_like.length}}</h1>
                  <h1 v-if="checkLikeSong()" class="mb-0 truncate mt-5 text-large glyph-icon" style="cursor:pointer;" @click="likeSong(song.id)"><img src="../../assets/img/heart/heart_full.png" style="width:32px;vertical-align:top;"/> {{this.song.like + this.song.user_like.length}}</h1>
                  <h1 class="mb-0 truncate mt-5 ml-5 text-large" @click="focusComment"><h1 class="glyph-icon simple-icon-bubble pb-0" style="cursor:pointer;"> {{comment.length}}</h1></h1>
                  <h1 class="mb-0 truncate mt-5 ml-5 text-large"><h1 class="glyph-icon simple-icon-control-play pb-0" style="cursor:pointer;" @click.prevent="addToPlaylistAndPlayNotify(song)"> 재생</h1></h1>
                  <h1 v-if="!isLoggedin" class="mb-0 truncate mt-5 ml-5 text-large"><h1 class="glyph-icon simple-icon-playlist pb-0" style="cursor:pointer;" @click.prevent="addToPlayListAndNotify(song)"> 추가</h1></h1>
                  <b-dropdown v-else variant="empty" toggle-class="p-0 m-0" no-caret style="position:absolute">
                      <template slot="button-content">
                          <h1 class="mb-0 truncate mt-5 ml-5 text-large"><h1 class="glyph-icon simple-icon-playlist pb-0 text-color" style="cursor:pointer;"> 추가</h1></h1>
                      </template>
                      <b-dropdown-item @click="addToPlaylistAndNotify(song)">현재 재생목록</b-dropdown-item>
                      <b-dropdown-item v-for="(playlist, index) in userPlayList" :key="index" @click="addToUserPlaylist(song, playlist, index)">{{ playlist.name }}</b-dropdown-item>
                  </b-dropdown>
                </div>
        </b-colxx>
      </b-colxx>
    </b-row>  
    <b-row>
      <b-colxx xxs="12">
        <div class="separator mb-5"></div>
      </b-colxx>
    </b-row>
    <b-row>
      <b-colxx xxs="12">
        
        <template v-if="!moreLyric">
          <h2>가사><a v-if="lyrics.length>10" @click="showMoreLyric" style="font-size:0.7em; float:right; cursor:pointer">더보기∨</a></h2>
        </template>
        <template v-else>
          <h2>가사><a v-if="lyrics.length>10" @click="showMoreLyric" style="font-size:0.7em; float:right; cursor:pointer">접기∧</a></h2>
        </template>
        <b-colxx xxs="12" class="mb-4 pl-3 pr-3">
          <h4 v-for="(lyric, index) in lyrics.slice(0,lyricSize)" v-bind:key="index">{{lyric}}</h4>
        </b-colxx>
      </b-colxx>
      <b-colxx xxs="12">
        <div class="separator mb-5"></div>
      </b-colxx>
    </b-row>
    <b-row>
      <b-colxx xxs="12">
        <h2 id="commentTitle">댓글></h2>
        <b-colxx xxs="12" class="mb-1 pl-3 pr-3 mt-1"  v-for="(cmt, index) in sortComment" v-bind:key="index">
          <b-colxx xxs="12" style="display: inline-flex;">
            <div style="width:16%;" class="mr-2">
              <h4 v-if="cmt.user" class="font-weight-medium mb-0" style="text-align:center;">{{cmt.user.username}}</h4>
            </div>
            <div style="width:70%;">
              <h4  class="mb-0">{{cmt.content}}</h4>
              <!-- <b-input type="text" :value="cmt.content">{{cmt.content}}</b-input> -->
            </div>
            <div style="margin-left: auto;">
              <p v-if="cmt.updated_at" class="text-muted mb-0 text-small">{{cmt.updated_at.substr(0,10)+" "+cmt.updated_at.substr(11,8)}}</p>
              <div v-if="checkComment(cmt.user.id)" calss="mb-0" style=" text-align:end;">
                <a class="mb-0 text-small text-primary" :id="'modify_text_'+index" style="cursor:pointer;" @click="ModifyMode(cmt.pk, index)">수정</a>
                <a class="mb-0 text-small text-primary" style="cursor:pointer;" @click="checkDelete(cmt.pk)">삭제</a>
              </div>
            </div>
          </b-colxx>
        </b-colxx>
        <b-input-group class="comment-contaiener pl-3 pr-3">
          <b-input placeholder="댓글" id="comment" @keyup.enter="sendComment"/>
          <template v-slot:append>
            <b-button variant="primary" @click="sendComment">
              <span class="d-inline-block" id="commentButton">작성</span>
              <i class="simple-icon-arrow-right ml-2"></i>
            </b-button>
          </template>
        </b-input-group>
      </b-colxx>
    </b-row>
    <LoginModal :showLogin="showLogin" @hideModal="showLogin=false"/>
    <b-modal v-model="showAlert" size="sm" hide-header hide-footer
        :hide-backdrop="true"
        :no-close-on-backdrop="true">
    <b-row style="justify-content: center;">
      <h4>{{alertText}}</h4>
    </b-row>
    <b-row class="mt-1" style="justify-content: center;">
       <b-button v-if="deleteCheck" class="mr-3" variant="danger" @click="showAlert=!showAlert;deleteCommet();">삭제</b-button>
        <b-button v-if="deleteCheck" variant="secondary" @click="showAlert=!showAlert;deleteCheck=!deleteCheck">취소</b-button>
        <b-button v-if="!deleteCheck" variant="secondary" @click="showAlert=!showAlert">확인</b-button>
    </b-row>
    </b-modal>
  </div>
</template>
<script>
import http from "../../utils/http-common"
import http2 from "../../utils/http-user"
import LoginModal from '@/components/User/LoginModal.vue'
import { mapGetters, mapMutations, mapActions, mapState } from "vuex"

const youtubeURL = 'https://www.googleapis.com/youtube/v3/search'
const API_KEY = process.env.VUE_APP_YOUTUBE_API_KEY

export default {
  components: {
    LoginModal,
  },
  created() {
    this.songID = this.$route.params.songID;
    http
      .get("/song/"+this.songID)
      .then((rest) => {
        this.song = rest.data;
        this.lyrics = this.song.lyric.split('/');
        if(rest.data.type=="sad"){
          this.song.type="슬픔";
        }else if(rest.data.type=="joy"){
          this.song.type="신남";
        }else if(rest.data.type=="love"){
          this.song.type="설렘";
        }
      })
    http
      .get("/song/"+this.songID+"/comment/")
      .then((rest) => {
        this.comment = rest.data;
      })
  },
  data () {
    return {
      deleteCheck: false,
      deletePK: 0,
      modifyComment: false,
      modifyPK: 0,
      modifyIndex: -1,
      showAlert: false,
      alertText: "",
      songID: 0,
      showLogin: false,
      lyricSize: 10,
      moreLyric:false,
      song: [],
      lyrics: [],
      comment: [],
    }
  },
  methods: {
    ...mapActions(["addToPlaylistAndPlay", "addToPlaylist", "likeSong"]),
    async addToPlaylistAndPlayNotify(data) {
      for(let i=0; i<this.playlist.length; i++) {
        if(this.playlist[i].id == data.id) {
          this.$notify('warning', "재생 목록에 이미 포함 된 곡입니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
          return
        }
      }
      this.addToPlaylistAndPlay(data)
      this.$notify('primary', "재생 중인 곡", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
    },
    async addToPlaylistAndNotify(data) {
      for(let i=0; i<this.playlist.length; i++) {
        if(this.playlist[i].id == data.id) {
          this.$notify('warning', "재생 목록에 이미 포함 된 곡입니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
          return
        }
      }
      this.addToPlaylist(data)
      this.$notify('primary', "재생 목록에 추가 되었습니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
    },
    addToUserPlaylist(data, playlist, index) {
      for(let i=0; i<playlist.song.length; i++) {
        if(playlist.song[i].id == data.id) {
          this.$notify('warning', "사용자 재생 목록에 이미 포함 된 곡입니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
          return
        }
      }
      http2
      .post(`playlist/${playlist.id}/song/`, {'songs': [data.id]}, this.config)
      .then((value)=> {
        this.$notify('primary', "사용자 재생 목록에 추가 되었습니다.", data.name+" - "+data.artist[0].name, { duration: 4000, permanent: false })
        this.userPlayList[index].song.push(data)
      })
    },
    checkLikeSong(){
      if (this.user) {
        return this.user.like_songs.includes(this.song.id)
      }
      return false
      
    },
    
    checkComment: function(id) {
      if(this.user){
        if(this.user.id == id){
          return true;
        }
      }
      return false;
    },
    sendComment: function(){
      if(this.user){
        const commentForm = new FormData();
        if(document.getElementById("comment").value.trim()==""){
          this.alertText="댓글을 작성해주세요.";
          this.showAlert=true;
          return;
        }
        commentForm.append("content", document.getElementById("comment").value)
        if(!this.modifyComment){
          http.post("song/" + this.songID + "/comment/",commentForm,{
            headers: {
              Authorization: this.$store.state.authorization
            },
            
          })
          .then((rest) => {
            var tag = document.getElementById('comment');
            console.log(tag);
            tag.value = "";
            http
            .get("song/"+this.songID+"/comment/")
            .then((rest) => {
              this.comment = rest.data;
            })  
          })  
        }else{
          http.put('song/'+this.modifyPK+"/comment/",commentForm,{
            headers: {
              Authorization: this.$store.state.authorization
            },
            
          })
          .then((rest) => {
            http
            .get("/song/"+this.songID+"/comment/")
            .then((rest) => {
              this.ModifyMode(this.modifyPK,this.modifyIndex);
              this.comment = rest.data;
            })
          })
        }
      }else{
        this.showLogin=true;
      }
    },
    checkDelete: function(pk){
      if(this.modifyComment){
        this.alertText="수정을 취소해주세요.";
        this.showAlert=true;
        return;
      }
      this.deletePK =pk;
      this.deleteCheck=true;
      this.alertText="댓글을 삭제하시겠습니까?";
      this.showAlert=true;
      return;
    },
    deleteCommet: function(){
      
      http.delete("song/"+this.deletePK+"/comment/",{
        headers: {
          Authorization: this.$store.state.authorization
        },
      })
      .then((rest) => {
        http
        .get("song/"+this.songID+"/comment/")
          .then((rest) => {
            this.comment = rest.data;
          })
      })
    },
    ModifyMode : function(pk, index){
      //$("#modify_format_"+pk).show();
      var tag1 = document.getElementById('comment');
      var tag2 = document.getElementById('modify_text_'+index);
      var tag3 = document.getElementById('commentButton');
      if(tag2.text == "수정"){
        tag1.value=this.comment[index].content;
        tag2.text = "취소";
        tag3.innerHTML = "수정";
        if(this.modifyIndex!=-1){
          var tag4 = document.getElementById('modify_text_'+this.modifyIndex);
          tag4.text = "수정";
        }
        this.modifyComment = true;
        this.modifyPK = pk;
        this.modifyIndex = index;
      }else{
        tag1.value="";
        tag2.text = "수정";
        tag3.innerHTML = "작성";
        this.modifyComment = false;
        this.modifyPK = 0;
        this.modifyIndex = -1;
      }
    },
    showMoreLyric: function(){
      this.moreLyric = !this.moreLyric;
      if(this.moreLyric){
        this.lyricSize = this.lyrics.length;
      }else{
        this.lyricSize = 10;
      }
    },
    focusComment: function(){
      var tag = document.getElementById('commentTitle');
      tag.scrollIntoView(true);
    },
  },
  mounted() {
    this.songID = this.$route.params.songID;
  },
  computed: {
    sortComment() {
      return this.comment.sort((a, b) => {
				if( a.updated_at.substr(0,10)+" "+a.updated_at.substr(11,8) > b.updated_at.substr(0,10)+" "+b.updated_at.substr(11,8) ) return 1;
				else if ( a.updated_at.substr(0,10)+" "+a.updated_at.substr(11,8) < b.updated_at.substr(0,10)+" "+b.updated_at.substr(11,8) ) return -1;
				else return 0;
			})
    },
    ...mapGetters({
      currentUser: "currentUser",
      // menuType: "getMenuType",
      // menuClickCount: "getMenuClickCount",
      // selectedMenuHasSubItems: "getSelectedMenuHasSubItems"
    }),
    ...mapState(['authorization', 'user', 'isLoggedin', 'playlist', 'userPlayList']),
    ...mapGetters(['config'])
  },
}
</script>
