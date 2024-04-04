import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import Card from 'react-bootstrap/Card';

function SearchUsers() {
    const [loading, setLoading] = useState(false);
    const [usersData, setUsersData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(null);
    let list = null;

    useEffect(() => {
        console.log('User Search useEffect')
        async function fetchData() {
            try {
                if (searchTerm !== null) {
                    console.log(searchTerm);
                    const { data } = await axios.get(`http://localhost:3001/users/${searchTerm}`);
                    setUsersData(data);
                    setLoading(false);
                } else {
                    setUsersData([]);
                    setLoading(false);
                }
            } catch (e) {
                console.log(e);
            }
        }
        fetchData();
    }, [searchTerm]);

    const handleSearch = (event) => {
        event.preventDefault();
        setSearchTerm(document.getElementById('searchTerm').value);
    }

    list =
        usersData.map((user) => {
            return (
                <Card id={user._id}>
                    <Card.Body>
                        <Card.Title>{user.firstName}  {user.lastName}</Card.Title>
                        <Card.Text>{user.email}</Card.Text>
                    </Card.Body>
                </Card>
            )
        });

    if (loading) {
        return (
            <div className="content">
                <form onSubmit={handleSearch}>
                    <div className='form-group'>
                        <label>
                            Search Term:
                            <input
                                className='form-control'
                                name='searchTerm'
                                id='searchTerm'
                                type='text'
                                placeholder='Search Term'
                                required
                            />
                        </label>
                    </div>
                    <button type='submit'>Search</button>
                </form>
                <div>
                    <h2>Loading. . . .</h2>
                </div>
            </div>
        );
    } else {
        return (
            <div className="content">
                <div className='container mx-auto'>
                    <form onSubmit={handleSearch}>
                        <div className='form-group'>
                            <label>
                                Search Term:
                                <input
                                    className='form-control'
                                    name='searchTerm'
                                    id='searchTerm'
                                    type='text'
                                    placeholder='Search Term'
                                    required
                                />
                            </label>
                        </div>
                        <button type='submit'>Search</button>
                    </form>
                </div>
                <div className="container">
                    {list}
                </div>
            </div>
        );
    }
}

export default SearchUsers;
