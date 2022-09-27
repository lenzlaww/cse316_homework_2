import React, { Component } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            song: this.props.MarkedSong,
            title: null,
            artist: null,
            youtubeId: null,
        }
    }

    handleTitleChange = (event) =>{
        if(event.target.value != ''){
            this.setState({
                title: event.target.value, 
            })
        }           
    }

    handleArtistChange = (event) => {
        if(event.target.value != ''){
            this.setState({
                artist: event.target.value
            })
        }
    }

    handleYoutubeIdChange = (event) =>{
        if(event.target.value != ''){
            this.setState({
                youtubeId: event.target.value
            })
        }
    }

    updateSong = () =>{
        if(this.state.title == null){
            this.setState({
                title: this.props.MarkedSong.title
            })
        }
        if(this.state.artist == null){
            this.setState({
                artist: this.props.MarkedSong.artist
            })
        }
        if(this.state.youtubeId == null){
            this.setState({
                youtubeId: this.props.MarkedSong.youTubeId
            })
        }
        let new_song = {
            title: this.state.title,
            artist:this.state.artist,
            youTubeId: this.state.youtubeId
        }

        this.props.editSongCallbck(this.props.SongIndexMarkedForEdit - 1, new_song);

    }

    render(){

        const {MarkedSong, currentList, hideEditSongModalCallback, editSongCallbck, SongIndexMarkedForEdit} = this.props;

        // let title='';
        // let artist='';
        // let youtubeId='';

        // console.log(SongIndexMarkedForEdit)
        // if(currentList){
        //     if(SongIndexMarkedForEdit){
        //     var song = currentList.songs[SongIndexMarkedForEdit - 1];
        //     title = song.title;
        //     artist = song.artist;
        //     youtubeId = song.youTubeId;

        //     }
        // }
        
        return(
            <div class="modal" id="edit-song-modal">
            <div class="modal-root" id="edit-song-modal-root">
                <div class="modal-north">
                    Edit Song
                </div>
                <div class="modal-center">
                    <div class="modal-center-content">
                        <b>
                            <div>Title:<input 
                                type="text" id="title" 
                                onChange={this.handleTitleChange}></input></div>
                            <div>Artist:<input 
                                type="text" id="artist" 
                                onChange={this.handleArtistChange}></input></div>
                            <div>You Tube Id:<input 
                                type="text" id="youTubeId" 
                                onChange={this.handleYoutubeIdChange}></input></div>
                        </b>
                    </div>
                </div>
                <div class="modal-south">
                    <input 
                        type="button" 
                        id="edit-song-confirm-button" 
                        class="modal-button" 
                        value='Confirm' 
                        onClick={()=>editSongCallbck(SongIndexMarkedForEdit - 1,{
                            title: document.getElementById("title").value,
                            artist: document.getElementById('artist').value,
                            youTubeId: document.getElementById('youTubeId').value
                        })}/>
                    <input 
                        type="button" 
                        id="edit-song-cancel-button" 
                        class="modal-button" 
                        value='Cancel'
                        onClick={hideEditSongModalCallback} />
                </div>
                
            </div>
        </div>
        );
    }
}