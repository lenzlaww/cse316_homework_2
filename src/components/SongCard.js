import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false,
            editSongActive: false,
        }
    }
    //delete song
    handleDeleteSong = (event) => {
        event.stopPropagation();
        let num = this.getItemNum();
        this.props.deleteSongCallback(num);
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    handleClick = (event) =>{
        if (event.detail === 2) {
            let num = this.getItemNum();
            this.props.editSongCallback(num);
        }
    }



    render() {
        const { song } = this.props;
        let num = this.getItemNum();
        console.log("num: " + num);
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        var hyperlink = ""
        if(song){
            var hyperlink = "https://www.youtube.com/watch?v=" + song.youTubeId;
        }
        
        return (
            
            <div
                id={'song-' + num}
                className={itemClass}
                onClick={this.handleClick}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                draggable="true"
            >
                <span>
                    {num}{". "}
                    <a href={hyperlink} target="_blank">
                    {song.title?song.title:null} by {song.artist?song.artist:null}</a>
                    
                </span>
                <input
                        type="button"
                        id={"delete-song-" + num}
                        className="song-card-button"
                        onClick={this.handleDeleteSong}
                        value={"✕"} />
            </div>
        )
    }
}