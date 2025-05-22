'use client'

import Navbar from '../components/Navbar';

function AboutPage() {
    return (
        <>
            <Navbar />
            <div >
                <h1>About Us</h1>
                <div >
                    <p>
                        Welcome to our learning platform! We are dedicated to providing high-quality
                        education and training in various fields, with a special focus on robotics
                        and technology.
                    </p>
                    <p>
                        Our mission is to make education accessible to everyone, everywhere. We believe
                        that learning should be engaging, interactive, and tailored to individual needs.
                    </p>
                </div>
            </div>
        </>
    );
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;