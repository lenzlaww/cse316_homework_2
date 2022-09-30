import React, { Component } from 'react';

export default class DeleteSongModal extends Component {
    render() {
        const { currentList, SongIndexMarkedForDeletion, deleteSongCallback, hideDeleteSongModalCallback } = this.props;
        console.log(SongIndexMarkedForDeletion)
        let name = ''
        if(currentList && SongIndexMarkedForDeletion){
            if(SongIndexMarkedForDeletion <= currentList.songs.length){
            var song = currentList.songs[SongIndexMarkedForDeletion - 1];
            name = song.title;
            }
        }
        
        
        
        return (
            <div 
                class="modal" 
                id="delete-song-modal" 
                data-animation="slideInOutLeft">
                    <div class="modal-root" id='verify-delete-song-root'>
                        <div class="modal-north">
                            Remove song?
                        </div>
                        <div class="modal-center">
                            <div class="modal-center-content">
                            Are you sure you wish to permanently remove <b>{name}</b> from the playlist?
                            </div>
                        </div>
                        <div class="modal-south">
                            <input type="button" 
                                id="delete-list-confirm-button" 
                                class="modal-button" 
                                onClick={deleteSongCallback}
                                value='Confirm' />
                            <input type="button" 
                                id="delete-list-cancel-button" 
                                class="modal-button" 
                                onClick={hideDeleteSongModalCallback}
                                value='Cancel' />
                        </div>
                    </div>
            </div>
        );
    }
}