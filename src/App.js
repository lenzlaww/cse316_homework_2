import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';


// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal';
import EditSongModal from './components/EditSongModal';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction';
import EditSong_Transaction from './transactions/EditSong_Transaction';


class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            SongNumMarkedForDeletion: null,
            SongIndexMarkedForEdit: null,
            SongMarkedForEdit: null,
            targetDeleteSong:null,
            show_modal: null,

        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    //Add a new song
    addNewSong = () =>{
        let newSong = {
            "title": "Untitled",
            "artist": "Unknown",
            "youTubeId": "dQw4w9WgXcQ"
        }
        let CurrentList = this.state.currentList;
        CurrentList.songs.push(newSong);

        this.setState(prevState => ({
            currentList: CurrentList,
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });

    }
    deleteNewSong = () =>{
        let currentList = this.state.currentList;
        currentList.songs.pop();
        this.setState(prevState => ({
            currentList: currentList,
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    addDeletedSong = (num) =>{
        let currentList = this.state.currentList;
        let deletedSong = this.state.targetDeleteSong;
        currentList.songs[num - 1]= deletedSong;
        this.setState(prevState=>({
            currentList: currentList
        }),()=>{
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        })
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteSong = (num) =>{
        let CurrentList = this.state.currentList;
        CurrentList.songs.splice(num -1 , 1);


        this.setState(prevState => ({
            currentList: CurrentList,
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    deleteMarkedSong = () => {
        this.addRemoveSongTransaction(this.state.SongNumMarkedForDeletion);
        this.hideDeleteSongModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    addAdditionSongTransaction = () =>{
        let transaction = new AddSong_Transaction(this);
        this.tps.addTransaction(transaction);
    }
    addRemoveSongTransaction=(num)=>{
        let transaction = new RemoveSong_Transaction(this,num);
        this.tps.addTransaction(transaction);
    }
    addEditSongTransaction=(index, new_song)=>{
        let old_song = this.state.currentList.songs[index];
        let transaction = new EditSong_Transaction(this, old_song, index, new_song);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    markSongForDeletion = (num) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            SongNumMarkedForDeletion: num,
            targetDeleteSong: prevState.currentList.songs[num-1],
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }
    showDeleteSongModal=()=>{
        let modal = document.getElementById('delete-song-modal');
        this.setState({
            show_modal: true
        })
        modal.classList.add("is-visible");
    }
    hideDeleteSongModal=()=>{
        let modal = document.getElementById('delete-song-modal');
        this.setState({
            show_modal: false
        })
        modal.classList.remove("is-visible");
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal=()=> {
        let modal = document.getElementById("delete-list-modal");
        this.setState({
            show_modal: true
        })
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal= () => {
        this.setState({
            show_modal: false
        })
        let modal = document.getElementById("delete-list-modal");
        modal.classList.remove("is-visible");
    }
    markSongForEdit= (num) =>{
        this.setState(prevState =>({
            SongIndexMarkedForEdit: num,
            currentList: prevState.currentList,
            SongMarkedForEdit: prevState.currentList.songs[num - 1]
        }),()=>{
            this.showEditSongModal();
        })
        
    }
    showEditSongModal = () =>{
        let modal = document.getElementById("edit-song-modal");
        this.setState({
            show_modal: true
        })
        modal.classList.add("is-visible");

        document.getElementById('title').value = this.state.currentList.songs[this.state.SongIndexMarkedForEdit - 1].title;
        document.getElementById('artist').value = this.state.currentList.songs[this.state.SongIndexMarkedForEdit - 1].artist;
        document.getElementById('youTubeId').value = this.state.currentList.songs[this.state.SongIndexMarkedForEdit - 1].youTubeId;
    }
    hideEditSongModal = () =>{
        let modal = document.getElementById("edit-song-modal");
        this.setState({
            show_modal: false
        })
        modal.classList.remove("is-visible");
    }
    editMarkedSong = (index, new_song) =>{
        let currentList = this.state.currentList;
        currentList.songs[index] = new_song;

        this.setState(prevState => ({
            currentList: currentList,
        }), () => {
            this.db.mutationUpdateList(this.state.currentList);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });

        this.hideEditSongModal();
    }
    
    // handlecontrolzy = (event) =>{
    //     if((event.metaKey||event.ctrlKey)&& event.key === 'z'){
    //         if(this.tps.hasTransactionToUndo()){
    //             this.undo();
    //         }
    //     }
    //     if((event.metaKey||event.ctrlKey)&& event.key === 'y'){
    //         if(this.tps.hasTransactionToRedo()){
    //             this.redo();
    //         }
    //     }
    // 

    run(){
        function keypress(event, app){
            if(event.ctrlKey&& !app.state.show_modal){
                if(event.key === 'z'){
                    app.undo();
                    app.setStateWithUpdatedList(app.state.currentList);
                }
                if(event.key ==='y'){
                    app.redo();
                    app.setStateWithUpdatedList(app.state.currentList);
                }
            }

        }
        document.onkeydown=(e) => keypress(e, this);
    }
    
    render() {
        this.run();
        if(this.state.currentList === null || this.state.show_modal === true){
            var canAddSong = false;
            var canUndo = false;
            var canRedo = false;
            var canClose = false;
        }else{
            canAddSong = this.state.currentList !== null;
            canUndo = this.tps.hasTransactionToUndo();
            canRedo = this.tps.hasTransactionToRedo();
            canClose = this.state.currentList !== null;
        }
        
        return (
            <div id="root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addSongCallback={this.addAdditionSongTransaction}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    deleteSongCallback={this.markSongForDeletion}
                    editSongCallback={this.markSongForEdit} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <DeleteSongModal 
                    hideDeleteSongModalCallback = {this.hideDeleteSongModal}
                    currentList={this.state.currentList}
                    SongIndexMarkedForDeletion={this.state.SongNumMarkedForDeletion}
                    deleteSongCallback = {this.deleteMarkedSong}/>
                <EditSongModal
                    currentList={this.state.currentList}
                    MarkedSong={this.state.SongMarkedForEdit}
                    hideEditSongModalCallback = {this.hideEditSongModal}
                    editSongCallbck = {this.addEditSongTransaction}
                    SongIndexMarkedForEdit={this.state.SongIndexMarkedForEdit}/>
            </div>
        );
    }
}

export default App;
