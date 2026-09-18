from conftest import register


def test_multiple_trusted_contacts(env):
    """User can create multiple trusted contacts with distinct roles."""
    c, _ = env
    h = register(c)

    # Add default trusted contact
    r1 = c.post(
        "/safety/contact",
        json={
            "name": "Sarah Connor",
            "phone": "+1-555-0101",
            "email": "sarah@example.com",
            "role": "trusted_contact",
        },
        headers=h,
    )
    assert r1.status_code == 201
    assert r1.json()["role"] == "trusted_contact"

    # Add best friend
    r2 = c.post(
        "/safety/contact",
        json={
            "name": "John Doe",
            "phone": "+1-555-0102",
            "email": "john@example.com",
            "role": "best_friend",
        },
        headers=h,
    )
    assert r2.status_code == 201
    assert r2.json()["role"] == "best_friend"

    # Add family member
    r3 = c.post(
        "/safety/contact",
        json={
            "name": "Mary Jane",
            "phone": "+1-555-0103",
            "email": "mary@example.com",
            "role": "family",
        },
        headers=h,
    )
    assert r3.status_code == 201
    assert r3.json()["role"] == "family"

    # Fetch all contacts
    all_contacts = c.get("/safety/contacts", headers=h)
    assert all_contacts.status_code == 200
    roles = [c["role"] for c in all_contacts.json()]
    assert len(roles) == 3
    assert set(roles) == {"trusted_contact", "best_friend", "family"}


def test_onboarding_profile_fields(env):
    """Save and retrieve new profile fields like language, interests, city."""
    c, _ = env
    h = register(c)

    # Get current profile
    prof = c.get("/wellness/profile", headers=h).json()

    # Update with new onboarding fields
    prof["language"] = "hi"
    prof["interests"] = ["meditation", "music", "reading"]
    prof["available_time_description"] = "Weekday evenings after 7pm"
    prof["city"] = "Pune"

    r = c.put("/wellness/profile", json=prof, headers=h)
    assert r.status_code == 200
    data = r.json()
    assert data["language"] == "hi"
    assert data["interests"] == ["meditation", "music", "reading"]
    assert data["available_time_description"] == "Weekday evenings after 7pm"
    assert data["city"] == "Pune"

    # Verify GET returns the persisted fields
    verify = c.get("/wellness/profile", headers=h).json()
    assert verify["language"] == "hi"
    assert verify["interests"] == ["meditation", "music", "reading"]
    assert verify["city"] == "Pune"


def test_contact_update_and_delete_by_role(env):
    """Updating same role updates existing contact, and deleting by role works."""
    c, _ = env
    h = register(c)

    # Create best friend
    c.post(
        "/safety/contact",
        json={
            "name": "Alex",
            "phone": "+1-555-9999",
            "role": "best_friend",
        },
        headers=h,
    )

    # Update best friend via PUT /safety/contact/best_friend
    r_update = c.put(
        "/safety/contact/best_friend",
        json={
            "name": "Alexander",
            "phone": "+1-555-8888",
            "role": "best_friend",
        },
        headers=h,
    )
    assert r_update.status_code == 200
    assert r_update.json()["name"] == "Alexander"
    assert r_update.json()["phone"] == "+1-555-8888"

    # Delete best friend
    r_del = c.delete("/safety/contact/best_friend", headers=h)
    assert r_del.status_code == 204

    # Verify contact is gone
    contacts = c.get("/safety/contacts", headers=h).json()
    assert not any(c["role"] == "best_friend" for c in contacts)
