import {Card, InputGroup, Button, FormControl} from 'react-bootstrap';
import React from 'react';
import {useState} from 'react';

export default function GenerateInviteCard() {

    const [link, setLink] = useState("");

    const copy = () => {
        navigator.clipboard.writeText(link);
    }

    const generateLink = () => {
        setLink("test");
    }

    return (
        <Card bg={'dark'} text={'light'}>
            <Card.Header>Invite Link</Card.Header>
            <Card.Body>
                <InputGroup className="mb-3" color={'primary'} >
                    <FormControl
                    style={{backgroundColor:'#32383e'}}
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