#!/usr/bin/env python
# -*- coding: utf-8 -*-

from collections import defaultdict
from slugify import slugify
from services import db


tags = db.Table(
    "tags",
    db.Column(
        "tag_title", db.String(128), db.ForeignKey("tag.title"), primary_key=True
    ),
    db.Column("thesis_id", db.String(10), db.ForeignKey("thesis.id"), primary_key=True),
)

class Tag(db.Model):
    """Represent a tag linked to a Wikidata ID."""

    aliases = db.Column(db.Text)
    description = db.Column(db.Text)
    labels = db.Column(db.Text)
    title = db.Column(db.String(128), primary_key=True)
    slug = db.Column(db.String(128), unique=True, nullable=False)
    url = db.Column(db.Text)
    wikidata_id = db.Column(db.String(16))
    wikipedia_title = db.Column(db.String(256))
    image = db.Column(db.String(255))

    def __repr__(self):
        return "<Tag #{}>".format(self.title)

    def make_slug(self):
        self.slug = slugify(self.title)

    def to_dict(
        self,
        thesis_count=None,
        include_theses_ids=False,
        include_related_tags=None,
        query_root_status=False,
    ):
        rv = {
            "title": self.title,
            "slug": self.slug,
            "wikidata_id": self.wikidata_id,
            "url": self.url,
        }

        if self.description is not None:
            rv["description"] = self.description

        if self.wikipedia_title is not None:
            rv["wikipedia_title"] = self.wikipedia_title

        if self.aliases is not None and len(self.aliases) > 0:
            rv["aliases"] = self.aliases.split(";")

        if self.labels is not None and len(self.labels) > 0:
            rv["labels"] = self.labels.split(";")

        if self.image is not None:
            rv["image"] = self.image

        if thesis_count is not None:
            rv["thesis_count"] = thesis_count

        if include_theses_ids:
            rv["theses"] = [thesis.id for thesis in self.theses]

        if include_related_tags is not None:
            rv["related_tags"] = self.related_tags(include_related_tags)

        if query_root_status:
            rv["root"] = self.is_root

        return rv

    def related_tags(self, format):
        """Return a dictionary of related tags.

        The return value distinguishes between parent tags, which are present
        on more than 80% of this tag's theses and themselves have at least as
        many theses as this tag does - and 'linked' tags, which are just tags
        that are present on this tag's theses.

        The number of returned tags in the 'linked' category is limited to ~15.
        """

        if format not in ["simple", "full"]:
            format = "simple"

        tag_counts = defaultdict(int)
        tags = dict()

        for thesis in self.theses:
            for tag in thesis.tags:
                if tag != self:
                    tag_counts[tag.title] += 1
                    tags[tag.title] = tag

        num_related_tags = 15
        try:
            # Determine the amount of tags where n=num_related_tags theses have
            # more related tags
            cutoff = sorted(tag_counts.values())[::-1][: num_related_tags + 1][-1]
        except IndexError:
            return {}
        else:
            rv = {"parents": {}, "linked": {}}

            self_theses_count = len(self.theses)

            for tag in tag_counts.keys():
                if tag_counts[tag] >= cutoff:
                    if (
                        tag_counts[tag] >= (0.8 * self_theses_count)
                        and len(tags[tag].theses) >= self_theses_count
                    ):
                        relation = "parents"
                    else:
                        relation = "linked"

                    if format == "full":
                        related_tag = tags[tag].to_dict()
                    else:
                        related_tag = tags[tag].slug

                    rv[relation][tag] = {"count": tag_counts[tag], "tag": related_tag}

            return rv

    @property
    def is_root(self):
        """Return true if this tag has no parent tagas in its related tags."""
        rl = self.related_tags('simple')
        return len(rl["parents"]) == 0
