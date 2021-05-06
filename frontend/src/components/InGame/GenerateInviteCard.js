import {Card, InputGroup, Button, FormControl} from 'react-bootstrap';
import React from 'react';
import {useState} from 'react';
import WorldService from 'services/WorldService';
import {URL_BASE} from 'config';

export default function GenerateInviteCard() {

    const [link, setLink] = useState("");

    const copy = () => {
        // TODO: give user some feedback 
        navigator.clipboard.writeText(link);
    }

    const generateLink = () => {
        
        WorldService.generateLink(1)
        .then( (res) => {return res.json()})
        .then( (res) => {
            if(res.access_token)
                setLink(URL_BASE + 'join?invite=' + res.access_token);
            else
                setLink("Invalid Token");
        } );
        
        
    }

    return (
        <Card bg={'dark'} text={'light'}>
            <Card.Header>Invite Link</Card.Header>
            <Card.Body>
                <InputGroup className="mb-3"  >
                    <FormControl
                    style={{backgroundColor:'#32383e', color: 'white'} }
                    readOnly
                    placeholder="Click to generate..."
                    aria-describedby="basic-addon2"
                    value={link}
                    />
                    <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={copy}>Copy</Button>
                    </InputGroup.Append>
                </InputGroup>
                <Button variant="primary" onClick={generateLink}>Generate Link</Button>
            </Card.Body>
        </Card>
    )


}