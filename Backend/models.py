from datetime import datetime
from typing import Optional
import uuid
from sqlmodel import Field, SQLModel


def _id() -> str:
    return str(uuid.uuid4())


class Article(SQLModel, table=True):
    __tablename__ = "articles"

    id: str = Field(default_factory=_id, primary_key=True)
    source: str = Field(index=True)          # newsapi | nytimes | guardian
    source_id: Optional[str] = Field(default=None, index=True)
    title: str
    dek: Optional[str] = None               # subtitle / description
    author: Optional[str] = None
    category: str = Field(default="Global", index=True)  # Tech, Policy, Climate …
    region: str = Field(default="Global", index=True)    # Global, US, Canada …
    url: str = Field(unique=True, index=True)
    image_url: Optional[str] = None
    published_at: datetime
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    read_time: int = Field(default=5)        # minutes
    views: int = Field(default=0)


class Opinion(SQLModel, table=True):
    __tablename__ = "opinions"

    id: str = Field(default_factory=_id, primary_key=True)
    author_name: str
    author_handle: Optional[str] = None
    author_role: Optional[str] = None
    title: str
    excerpt: str
    body: Optional[str] = None
    tag: str = Field(default="General", index=True)
    read_time: int = Field(default=5)
    likes: int = Field(default=0)
    status: str = Field(default="published", index=True)  # draft | pending | published
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=_id, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: Optional[str] = Field(default=None, index=True)
    handle: Optional[str] = None
    role_label: Optional[str] = None        # e.g. "Law student, Toronto"
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Draft(SQLModel, table=True):
    __tablename__ = "drafts"

    id: str = Field(default_factory=_id, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True)
    session_id: Optional[str] = Field(default=None, index=True)  # anonymous drafts
    title: Optional[str] = None
    body: str = Field(default="")
    desk: Optional[str] = None              # Policy | Climate | Tech | Culture
    word_count: int = Field(default=0)
    status: str = Field(default="draft", index=True)  # draft | submitted | accepted | rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class NewsletterSubscription(SQLModel, table=True):
    __tablename__ = "newsletter_subscriptions"

    id: str = Field(default_factory=_id, primary_key=True)
    email: str = Field(unique=True, index=True)
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = Field(default=True)
